import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface DentistaPerformance {
  dentista_id: string;
  dentista_nome: string;
  total_procedimentos: number;
  faturamento_total: number;
  total_comissao: number;
  crescimento: string;
  percentual_performance: number;
}

export interface ProcedimentoDentista {
  dentista_id: string;
  dentista_nome: string;
  procedimento: string;
  quantidade: number;
  valor_total: number;
}

export const useGanhoDentista = (dataInicio?: Date, dataFim?: Date) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [performanceDentistas, setPerformanceDentistas] = useState<DentistaPerformance[]>([]);
  const [topProcedimentos, setTopProcedimentos] = useState<ProcedimentoDentista[]>([]);

  const fetchRelatorio = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar todos os dentistas
      const { data: dentistas, error: dentistasError } = await supabase
        .from('dentistas')
        .select('id, nome')
        .eq('user_id', user.id)
        .eq('status', 'Ativo');

      if (dentistasError) throw dentistasError;

      // Preparar filtros de data
      let agendamentosQuery = supabase
        .from('agendamentos')
        .select('dentista_id, valor, procedimento, status')
        .eq('user_id', user.id)
        .in('status', ['Concluído', 'Realizado']);

      if (dataInicio) {
        agendamentosQuery = agendamentosQuery.gte('data_agendamento', dataInicio.toISOString());
      }
      if (dataFim) {
        agendamentosQuery = agendamentosQuery.lte('data_agendamento', dataFim.toISOString());
      }

      const { data: agendamentos, error: agendamentosError } = await agendamentosQuery;
      if (agendamentosError) throw agendamentosError;

      // Buscar comissões
      let comissoesQuery = supabase
        .from('comissoes')
        .select('dentista_id, valor_comissao')
        .eq('user_id', user.id)
        .eq('status', 'Paga');

      if (dataInicio) {
        comissoesQuery = comissoesQuery.gte('data_inicio', dataInicio.toISOString().split('T')[0]);
      }
      if (dataFim) {
        comissoesQuery = comissoesQuery.lte('data_fim', dataFim.toISOString().split('T')[0]);
      }

      const { data: comissoes, error: comissoesError } = await comissoesQuery;
      if (comissoesError) throw comissoesError;

      // Calcular performance por dentista
      const performance: DentistaPerformance[] = (dentistas || []).map((dentista) => {
        const agendamentosDentista = (agendamentos || []).filter(a => a.dentista_id === dentista.id);
        const comissoesDentista = (comissoes || []).filter(c => c.dentista_id === dentista.id);

        const totalProcedimentos = agendamentosDentista.length;
        const faturamentoTotal = agendamentosDentista.reduce((sum, a) => sum + Number(a.valor || 0), 0);
        const totalComissao = comissoesDentista.reduce((sum, c) => sum + Number(c.valor_comissao || 0), 0);

        // Calcular percentual de performance (baseado em meta de 100k)
        const metaMensal = 100000;
        const percentualPerformance = (faturamentoTotal / metaMensal) * 100;

        return {
          dentista_id: dentista.id,
          dentista_nome: dentista.nome,
          total_procedimentos: totalProcedimentos,
          faturamento_total: faturamentoTotal,
          total_comissao: totalComissao,
          crescimento: '+0%', // Pode ser calculado comparando com período anterior
          percentual_performance: Math.min(percentualPerformance, 100)
        };
      });

      // Calcular top procedimentos por dentista
      const procedimentosMap = new Map<string, ProcedimentoDentista>();
      
      (agendamentos || []).forEach((agendamento) => {
        const key = `${agendamento.dentista_id}-${agendamento.procedimento}`;
        const dentista = (dentistas || []).find(d => d.id === agendamento.dentista_id);
        
        if (dentista) {
          const existing = procedimentosMap.get(key);
          if (existing) {
            existing.quantidade += 1;
            existing.valor_total += Number(agendamento.valor || 0);
          } else {
            procedimentosMap.set(key, {
              dentista_id: agendamento.dentista_id,
              dentista_nome: dentista.nome,
              procedimento: agendamento.procedimento,
              quantidade: 1,
              valor_total: Number(agendamento.valor || 0)
            });
          }
        }
      });

      const topProcs = Array.from(procedimentosMap.values())
        .sort((a, b) => b.valor_total - a.valor_total)
        .slice(0, 10);

      setPerformanceDentistas(performance);
      setTopProcedimentos(topProcs);
    } catch (error: any) {
      console.error('Erro ao buscar relatório:', error);
      toast.error('Erro ao carregar relatório de ganho por dentista');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorio();
  }, [user, dataInicio, dataFim]);

  return {
    performanceDentistas,
    topProcedimentos,
    loading,
    refetch: fetchRelatorio
  };
};
