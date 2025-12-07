import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ContaPagar {
  id: string;
  fornecedor_id: string | null;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  status: string;
  observacoes: string | null;
  fornecedor_nome?: string;
}

export interface PagamentoData {
  conta_id: string;
  forma_pagamento: string;
  data_pagamento: string;
  valor_pago: number;
  observacoes?: string;
}

export const usePagamentos = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [contasPendentes, setContasPendentes] = useState<ContaPagar[]>([]);

  const fetchContasPendentes = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Buscar fornecedores primeiro
      const { data: fornecedores, error: fornecedoresError } = await supabase
        .from('fornecedores')
        .select('id, nome')
        .eq('user_id', user.id);

      if (fornecedoresError) throw fornecedoresError;

      // Buscar contas a pagar pendentes e vencidas
      const { data: contas, error: contasError } = await supabase
        .from('contas_pagar')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['Pendente', 'Vencida'])
        .order('data_vencimento', { ascending: true });

      if (contasError) throw contasError;

      // Mapear contas com nomes dos fornecedores
      const contasComFornecedores = (contas || []).map(conta => {
        const fornecedor = (fornecedores || []).find(f => f.id === conta.fornecedor_id);
        return {
          ...conta,
          fornecedor_nome: fornecedor?.nome || 'Fornecedor não especificado'
        };
      });

      setContasPendentes(contasComFornecedores);
    } catch (error: any) {
      console.error('Erro ao buscar contas pendentes:', error);
      toast.error('Erro ao carregar contas pendentes');
    } finally {
      setLoading(false);
    }
  };

  const efetuarPagamento = async (dados: PagamentoData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return false;
    }

    try {
      const { error } = await supabase
        .from('contas_pagar')
        .update({
          status: 'Paga',
          data_pagamento: dados.data_pagamento,
          forma_pagamento: dados.forma_pagamento,
          observacoes: dados.observacoes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', dados.conta_id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Pagamento efetuado com sucesso!');
      await fetchContasPendentes(); // Recarregar lista
      return true;
    } catch (error: any) {
      console.error('Erro ao efetuar pagamento:', error);
      toast.error('Erro ao efetuar pagamento');
      return false;
    }
  };

  useEffect(() => {
    fetchContasPendentes();
  }, [user]);

  return {
    contasPendentes,
    loading,
    efetuarPagamento,
    refetch: fetchContasPendentes
  };
};
