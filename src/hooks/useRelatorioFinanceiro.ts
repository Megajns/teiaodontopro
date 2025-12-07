import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DadosFinanceiros {
  receitas_total: number;
  despesas_total: number;
  saldo: number;
  contas_receber_pendente: number;
  contas_pagar_pendente: number;
  cheques_compensar: number;
  receitas_por_categoria: { categoria: string; valor: number }[];
  despesas_por_categoria: { categoria: string; valor: number }[];
  fluxo_mensal: { mes: string; receitas: number; despesas: number }[];
}

export const useRelatorioFinanceiro = (dataInicio?: Date, dataFim?: Date) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dadosFinanceiros, setDadosFinanceiros] = useState<DadosFinanceiros>({
    receitas_total: 0,
    despesas_total: 0,
    saldo: 0,
    contas_receber_pendente: 0,
    contas_pagar_pendente: 0,
    cheques_compensar: 0,
    receitas_por_categoria: [],
    despesas_por_categoria: [],
    fluxo_mensal: []
  });

  const fetchRelatorioFinanceiro = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar contas a receber (recebidas)
      let contasReceberQuery = supabase
        .from('contas_receber')
        .select('valor, categoria, data_recebimento')
        .eq('user_id', user.id)
        .eq('status', 'Recebida')
        .not('data_recebimento', 'is', null);

      if (dataInicio) {
        contasReceberQuery = contasReceberQuery.gte('data_recebimento', dataInicio.toISOString().split('T')[0]);
      }
      if (dataFim) {
        contasReceberQuery = contasReceberQuery.lte('data_recebimento', dataFim.toISOString().split('T')[0]);
      }

      const { data: contasReceber, error: receberError } = await contasReceberQuery;
      if (receberError) throw receberError;

      // Buscar agendamentos realizados
      let agendamentosQuery = supabase
        .from('agendamentos')
        .select('valor, procedimento, data_agendamento')
        .eq('user_id', user.id)
        .in('status', ['Concluído', 'Realizado'])
        .not('valor', 'is', null);

      if (dataInicio) {
        agendamentosQuery = agendamentosQuery.gte('data_agendamento', dataInicio.toISOString());
      }
      if (dataFim) {
        agendamentosQuery = agendamentosQuery.lte('data_agendamento', dataFim.toISOString());
      }

      const { data: agendamentos, error: agendamentosError } = await agendamentosQuery;
      if (agendamentosError) throw agendamentosError;

      // Buscar contas a pagar (pagas)
      let contasPagarQuery = supabase
        .from('contas_pagar')
        .select('valor, categoria, data_pagamento')
        .eq('user_id', user.id)
        .eq('status', 'Paga')
        .not('data_pagamento', 'is', null);

      if (dataInicio) {
        contasPagarQuery = contasPagarQuery.gte('data_pagamento', dataInicio.toISOString().split('T')[0]);
      }
      if (dataFim) {
        contasPagarQuery = contasPagarQuery.lte('data_pagamento', dataFim.toISOString().split('T')[0]);
      }

      const { data: contasPagar, error: pagarError } = await contasPagarQuery;
      if (pagarError) throw pagarError;

      // Buscar comissões pagas
      let comissoesQuery = supabase
        .from('comissoes')
        .select('valor_comissao, data_pagamento')
        .eq('user_id', user.id)
        .eq('status', 'Paga')
        .not('data_pagamento', 'is', null);

      if (dataInicio) {
        comissoesQuery = comissoesQuery.gte('data_pagamento', dataInicio.toISOString().split('T')[0]);
      }
      if (dataFim) {
        comissoesQuery = comissoesQuery.lte('data_pagamento', dataFim.toISOString().split('T')[0]);
      }

      const { data: comissoes, error: comissoesError } = await comissoesQuery;
      if (comissoesError) throw comissoesError;

      // Buscar contas pendentes (independente do período)
      const { data: contasReceberPendentes } = await supabase
        .from('contas_receber')
        .select('valor')
        .eq('user_id', user.id)
        .eq('status', 'Pendente');

      const { data: contasPagarPendentes } = await supabase
        .from('contas_pagar')
        .select('valor')
        .eq('user_id', user.id)
        .eq('status', 'Pendente');

      // Buscar cheques a compensar
      const { data: chequesCompensar } = await supabase
        .from('cheques')
        .select('valor')
        .eq('user_id', user.id)
        .eq('status', 'A Compensar');

      // Calcular totais de receitas
      const receitasContas = (contasReceber || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);
      const receitasAgendamentos = (agendamentos || []).reduce((sum, a) => sum + Number(a.valor || 0), 0);
      const receitasTotal = receitasContas + receitasAgendamentos;

      // Calcular totais de despesas
      const despesasContas = (contasPagar || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);
      const despesasComissoes = (comissoes || []).reduce((sum, c) => sum + Number(c.valor_comissao || 0), 0);
      const despesasTotal = despesasContas + despesasComissoes;

      // Calcular saldo
      const saldo = receitasTotal - despesasTotal;

      // Calcular pendências
      const contasReceberPendente = (contasReceberPendentes || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);
      const contasPagarPendente = (contasPagarPendentes || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);
      const chequesCompensarTotal = (chequesCompensar || []).reduce((sum, c) => sum + Number(c.valor || 0), 0);

      // Agrupar receitas por categoria
      const receitasPorCategoria = new Map<string, number>();
      (contasReceber || []).forEach(c => {
        const atual = receitasPorCategoria.get(c.categoria) || 0;
        receitasPorCategoria.set(c.categoria, atual + Number(c.valor || 0));
      });
      (agendamentos || []).forEach(a => {
        const categoria = a.procedimento || 'Outros';
        const atual = receitasPorCategoria.get(categoria) || 0;
        receitasPorCategoria.set(categoria, atual + Number(a.valor || 0));
      });

      // Agrupar despesas por categoria
      const despesasPorCategoria = new Map<string, number>();
      (contasPagar || []).forEach(c => {
        const atual = despesasPorCategoria.get(c.categoria) || 0;
        despesasPorCategoria.set(c.categoria, atual + Number(c.valor || 0));
      });
      despesasPorCategoria.set('Comissões', despesasComissoes);

      // Converter para array
      const receitasPorCategoriaArray = Array.from(receitasPorCategoria.entries())
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor);

      const despesasPorCategoriaArray = Array.from(despesasPorCategoria.entries())
        .map(([categoria, valor]) => ({ categoria, valor }))
        .sort((a, b) => b.valor - a.valor);

      // Calcular fluxo mensal (agregação real por mês dentro do período)
      const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

      const inicioPeriodo = dataInicio
        ? new Date(dataInicio)
        : new Date(new Date().setMonth(new Date().getMonth() - 5));
      inicioPeriodo.setDate(1);
      const fimPeriodo = dataFim ? new Date(dataFim) : new Date();

      // Gera chaves mensais entre início e fim inclusive
      const monthKeys: { key: string; label: string; year: number; month: number }[] = [];
      const cursor = new Date(inicioPeriodo);
      cursor.setHours(0, 0, 0, 0);
      while (cursor <= fimPeriodo) {
        const y = cursor.getFullYear();
        const m = cursor.getMonth();
        const key = `${y}-${String(m + 1).padStart(2, '0')}`;
        const label = `${mesesNomes[m]}`; // mantém só o nome curto do mês para compatibilidade com UI
        monthKeys.push({ key, label, year: y, month: m });
        cursor.setMonth(cursor.getMonth() + 1);
        cursor.setDate(1);
      }

      const mensalMap: Record<string, { mes: string; receitas: number; despesas: number }> = {};
      monthKeys.forEach(({ key, label }) => {
        mensalMap[key] = { mes: label, receitas: 0, despesas: 0 };
      });

      const getMonthKey = (dtStr?: string | null) => {
        if (!dtStr) return null;
        const d = new Date(dtStr);
        if (isNaN(d.getTime())) return null;
        const y = d.getFullYear();
        const m = d.getMonth();
        return `${y}-${String(m + 1).padStart(2, '0')}`;
      };

      // Soma receitas por mês (contas recebidas + agendamentos realizados)
      (contasReceber || []).forEach(c => {
        const key = getMonthKey(c.data_recebimento as any);
        if (key && mensalMap[key]) {
          mensalMap[key].receitas += Number(c.valor || 0);
        }
      });
      (agendamentos || []).forEach(a => {
        const key = getMonthKey(a.data_agendamento as any);
        if (key && mensalMap[key]) {
          mensalMap[key].receitas += Number(a.valor || 0);
        }
      });

      // Soma despesas por mês (contas pagas + comissões pagas)
      (contasPagar || []).forEach(c => {
        const key = getMonthKey(c.data_pagamento as any);
        if (key && mensalMap[key]) {
          mensalMap[key].despesas += Number(c.valor || 0);
        }
      });
      (comissoes || []).forEach(c => {
        const key = getMonthKey(c.data_pagamento as any);
        if (key && mensalMap[key]) {
          mensalMap[key].despesas += Number(c.valor_comissao || 0);
        }
      });

      const fluxoMensal = monthKeys.map(({ key }) => mensalMap[key]);

      setDadosFinanceiros({
        receitas_total: receitasTotal,
        despesas_total: despesasTotal,
        saldo,
        contas_receber_pendente: contasReceberPendente,
        contas_pagar_pendente: contasPagarPendente,
        cheques_compensar: chequesCompensarTotal,
        receitas_por_categoria: receitasPorCategoriaArray,
        despesas_por_categoria: despesasPorCategoriaArray,
        fluxo_mensal: fluxoMensal
      });
    } catch (error: any) {
      console.error('Erro ao buscar relatório financeiro:', error);
      toast.error('Erro ao carregar relatório financeiro');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorioFinanceiro();
  }, [user, dataInicio, dataFim]);

  return {
    dadosFinanceiros,
    loading,
    refetch: fetchRelatorioFinanceiro
  };
};
