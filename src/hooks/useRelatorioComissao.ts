import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ComissaoDetalhada {
  id: string;
  dentista_id: string;
  dentista_nome: string;
  referencia: string;
  data_inicio: string;
  data_fim: string;
  valor_total_procedimentos: number;
  percentual_comissao: number;
  valor_comissao: number;
  status: string;
  data_pagamento: string | null;
  forma_pagamento: string | null;
}

export interface ResumoComissoes {
  total_pago: number;
  total_pendente: number;
  total_geral: number;
  quantidade_paga: number;
  quantidade_pendente: number;
}

export const useRelatorioComissao = (dataInicio?: Date, dataFim?: Date) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [comissoes, setComissoes] = useState<ComissaoDetalhada[]>([]);
  const [resumo, setResumo] = useState<ResumoComissoes>({
    total_pago: 0,
    total_pendente: 0,
    total_geral: 0,
    quantidade_paga: 0,
    quantidade_pendente: 0
  });

  const fetchRelatorioComissao = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar dentistas primeiro
      const { data: dentistas, error: dentistasError } = await supabase
        .from('dentistas')
        .select('id, nome')
        .eq('user_id', user.id);

      if (dentistasError) throw dentistasError;

      // Buscar comissões
      let comissoesQuery = supabase
        .from('comissoes')
        .select('*')
        .eq('user_id', user.id)
        .order('data_inicio', { ascending: false });

      if (dataInicio) {
        comissoesQuery = comissoesQuery.gte('data_inicio', dataInicio.toISOString().split('T')[0]);
      }
      if (dataFim) {
        comissoesQuery = comissoesQuery.lte('data_fim', dataFim.toISOString().split('T')[0]);
      }

      const { data: comissoesData, error: comissoesError } = await comissoesQuery;
      if (comissoesError) throw comissoesError;

      // Mapear comissões com nomes dos dentistas
      const comissoesDetalhadas: ComissaoDetalhada[] = (comissoesData || []).map(c => {
        const dentista = (dentistas || []).find(d => d.id === c.dentista_id);
        return {
          id: c.id,
          dentista_id: c.dentista_id,
          dentista_nome: dentista?.nome || 'Dentista não encontrado',
          referencia: c.referencia,
          data_inicio: c.data_inicio,
          data_fim: c.data_fim,
          valor_total_procedimentos: Number(c.valor_total_procedimentos || 0),
          percentual_comissao: Number(c.percentual_comissao || 0),
          valor_comissao: Number(c.valor_comissao || 0),
          status: c.status,
          data_pagamento: c.data_pagamento,
          forma_pagamento: c.forma_pagamento
        };
      });

      // Calcular resumo
      const totalPago = comissoesDetalhadas
        .filter(c => c.status === 'Paga')
        .reduce((sum, c) => sum + c.valor_comissao, 0);

      const totalPendente = comissoesDetalhadas
        .filter(c => c.status === 'Pendente')
        .reduce((sum, c) => sum + c.valor_comissao, 0);

      const quantidadePaga = comissoesDetalhadas.filter(c => c.status === 'Paga').length;
      const quantidadePendente = comissoesDetalhadas.filter(c => c.status === 'Pendente').length;

      setComissoes(comissoesDetalhadas);
      setResumo({
        total_pago: totalPago,
        total_pendente: totalPendente,
        total_geral: totalPago + totalPendente,
        quantidade_paga: quantidadePaga,
        quantidade_pendente: quantidadePendente
      });
    } catch (error: any) {
      console.error('Erro ao buscar relatório de comissões:', error);
      toast.error('Erro ao carregar relatório de comissões');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRelatorioComissao();
  }, [user, dataInicio, dataFim]);

  return {
    comissoes,
    resumo,
    loading,
    refetch: fetchRelatorioComissao
  };
};
