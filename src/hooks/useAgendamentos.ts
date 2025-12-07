import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Agendamento {
  id: string;
  paciente_id: string;
  dentista_id: string;
  data_agendamento: string;
  duracao: number;
  procedimento: string;
  status: string;
  tipo_atendimento: string;
  convenio_id?: string;
  valor?: number;
  observacoes?: string;
  confirmado: boolean;
  created_at?: string;
  updated_at?: string;
  pacientes?: {
    nome: string;
    telefone: string;
    email: string;
  };
  dentistas?: {
    nome: string;
  };
  convenios?: {
    nome: string;
  };
}

export const useAgendamentos = () => {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAgendamentos = async (startDate?: Date, endDate?: Date) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      let query = supabase
        .from("agendamentos")
        .select("*")
        .eq("user_id", user.id)
        .order("data_agendamento", { ascending: true });

      if (startDate) {
        query = query.gte("data_agendamento", startDate.toISOString());
      }
      
      if (endDate) {
        query = query.lte("data_agendamento", endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Fetch relacionamentos
      if (data && data.length > 0) {
        const pacienteIds = [...new Set(data.map(a => a.paciente_id))];
        const dentistaIds = [...new Set(data.map(a => a.dentista_id))];
        const convenioIds = [...new Set(data.map(a => a.convenio_id).filter(Boolean))];

        const [pacientesData, dentistasData, conveniosData] = await Promise.all([
          supabase.from("pacientes").select("id, nome, telefone, email").in("id", pacienteIds),
          supabase.from("dentistas").select("id, nome").in("id", dentistaIds),
          convenioIds.length > 0 
            ? supabase.from("convenios").select("id, nome").in("id", convenioIds)
            : Promise.resolve({ data: [] })
        ]);

        const pacientesMap = new Map<string, any>();
        pacientesData.data?.forEach(p => pacientesMap.set(p.id, p));
        
        const dentistasMap = new Map<string, any>();
        dentistasData.data?.forEach(d => dentistasMap.set(d.id, d));
        
        const conveniosMap = new Map<string, any>();
        conveniosData.data?.forEach(c => conveniosMap.set(c.id, c));

        const agendamentosWithRelations = data.map(a => ({
          ...a,
          pacientes: pacientesMap.get(a.paciente_id),
          dentistas: dentistasMap.get(a.dentista_id),
          convenios: a.convenio_id ? conveniosMap.get(a.convenio_id) : undefined
        }));

        setAgendamentos(agendamentosWithRelations as Agendamento[]);
      } else {
        setAgendamentos([]);
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar agendamentos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createAgendamento = async (agendamento: Omit<Agendamento, "id" | "created_at" | "updated_at" | "pacientes" | "dentistas" | "convenios">) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("agendamentos")
        .insert([{ ...agendamento, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Agendamento criado",
        description: "Agendamento cadastrado com sucesso!",
      });

      await fetchAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro ao criar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAgendamento = async (id: string, agendamento: Partial<Agendamento>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("agendamentos")
        .update(agendamento)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Agendamento atualizado",
        description: "Agendamento atualizado com sucesso!",
      });

      await fetchAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteAgendamento = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("agendamentos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Agendamento excluído",
        description: "Agendamento excluído com sucesso!",
      });

      await fetchAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmarAgendamento = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("agendamentos")
        .update({ confirmado: true, status: "Confirmado" })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Agendamento confirmado",
        description: "Agendamento confirmado com sucesso!",
      });

      await fetchAgendamentos();
    } catch (error: any) {
      toast({
        title: "Erro ao confirmar agendamento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    agendamentos,
    loading,
    fetchAgendamentos,
    createAgendamento,
    updateAgendamento,
    deleteAgendamento,
    confirmarAgendamento,
  };
};
