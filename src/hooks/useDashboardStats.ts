import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { startOfMonth, endOfMonth, startOfDay, endOfDay } from "date-fns";

export const useDashboardStats = () => {
  const { user } = useAuth();

  // Total de Pacientes
  const { data: totalPacientes = 0 } = useQuery({
    queryKey: ["dashboard-total-pacientes", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { count, error } = await supabase
        .from("pacientes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "Ativo");

      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Agendamentos de hoje
  const { data: agendamentosHoje } = useQuery({
    queryKey: ["dashboard-agendamentos-hoje", user?.id],
    queryFn: async () => {
      if (!user?.id) return { total: 0, confirmados: 0, pendentes: 0 };

      const hoje = new Date();
      const inicioHoje = startOfDay(hoje).toISOString();
      const fimHoje = endOfDay(hoje).toISOString();

      const { data, error } = await supabase
        .from("agendamentos")
        .select("status")
        .eq("user_id", user.id)
        .gte("data_agendamento", inicioHoje)
        .lte("data_agendamento", fimHoje);

      if (error) throw error;

      const confirmados = data?.filter(a => a.status === "Confirmado").length || 0;
      const pendentes = data?.filter(a => a.status === "Agendado").length || 0;

      return {
        total: data?.length || 0,
        confirmados,
        pendentes,
      };
    },
    enabled: !!user?.id,
  });

  // Faturamento mensal (contas recebidas este mês)
  const { data: faturamentoMensal = 0 } = useQuery({
    queryKey: ["dashboard-faturamento-mensal", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const hoje = new Date();
      const inicioMes = startOfMonth(hoje).toISOString();
      const fimMes = endOfMonth(hoje).toISOString();

      const { data, error } = await supabase
        .from("contas_receber")
        .select("valor")
        .eq("user_id", user.id)
        .eq("status", "Recebida")
        .gte("data_recebimento", inicioMes)
        .lte("data_recebimento", fimMes);

      if (error) throw error;

      const total = data?.reduce((sum, item) => sum + Number(item.valor || 0), 0) || 0;
      return total;
    },
    enabled: !!user?.id,
  });

  // Produtos com estoque baixo
  const { data: produtosFalta = 0 } = useQuery({
    queryKey: ["dashboard-produtos-falta", user?.id],
    queryFn: async () => {
      if (!user?.id) return 0;

      const { data, error } = await supabase
        .from("estoque")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      // Contar produtos onde estoque atual está abaixo do mínimo
      const produtosAbaixoMinimo = data?.filter(
        item => item.estoque < item.minimo
      ).length || 0;

      return produtosAbaixoMinimo;
    },
    enabled: !!user?.id,
  });

  // Próximos agendamentos do dia
  const { data: proximosAgendamentos = [] } = useQuery({
    queryKey: ["dashboard-proximos-agendamentos", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const hoje = new Date();
      const inicioHoje = startOfDay(hoje).toISOString();
      const fimHoje = endOfDay(hoje).toISOString();

      const { data: agendamentos, error } = await supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", user.id)
        .gte("data_agendamento", inicioHoje)
        .lte("data_agendamento", fimHoje)
        .order("data_agendamento", { ascending: true })
        .limit(5);

      if (error) throw error;
      if (!agendamentos) return [];

      // Buscar nomes dos pacientes e dentistas
      const pacienteIds = [...new Set(agendamentos.map(a => a.paciente_id))];
      const dentistaIds = [...new Set(agendamentos.map(a => a.dentista_id))];

      const { data: pacientes } = await supabase
        .from("pacientes")
        .select("id, nome")
        .in("id", pacienteIds);

      const { data: dentistas } = await supabase
        .from("dentistas")
        .select("id, nome")
        .in("id", dentistaIds);

      const pacientesMap = new Map(pacientes?.map(p => [p.id, p.nome]) || []);
      const dentistasMap = new Map(dentistas?.map(d => [d.id, d.nome]) || []);

      return agendamentos.map(agendamento => ({
        id: agendamento.id,
        time: new Date(agendamento.data_agendamento).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        patient: pacientesMap.get(agendamento.paciente_id) || "Paciente não identificado",
        dentista: dentistasMap.get(agendamento.dentista_id) || "Dentista não identificado",
        procedure: agendamento.procedimento,
        status: agendamento.status,
      }));
    },
    enabled: !!user?.id,
  });

  // Itens de estoque baixo (detalhados)
  const { data: estoqueBaixo = [] } = useQuery({
    queryKey: ["dashboard-estoque-baixo", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("estoque")
        .select("*")
        .eq("user_id", user.id)
        .order("estoque", { ascending: true });

      if (error) throw error;

      // Retornar apenas produtos abaixo do mínimo
      return data?.filter(item => item.estoque < item.minimo)
        .slice(0, 5)
        .map(item => ({
          name: item.item,
          current: item.estoque,
          minimum: item.minimo,
        })) || [];
    },
    enabled: !!user?.id,
  });

  return {
    stats: {
      totalPacientes,
      agendamentosHoje: agendamentosHoje || { total: 0, confirmados: 0, pendentes: 0 },
      faturamentoMensal,
      produtosFalta,
    },
    proximosAgendamentos,
    estoqueBaixo,
    isLoading: false,
  };
};
