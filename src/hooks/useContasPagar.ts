import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ContaPagar {
  id: string;
  user_id: string;
  fornecedor_id?: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'Pendente' | 'Paga' | 'Vencida' | 'Cancelada';
  forma_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  fornecedores?: {
    nome: string;
  };
}

export interface CreateContaPagarData {
  fornecedor_id?: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'Pendente' | 'Paga' | 'Vencida' | 'Cancelada';
  forma_pagamento?: string;
  observacoes?: string;
}

export function useContasPagar() {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchContas = async () => {
    if (!user) {
      setContas([]);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('contas_pagar')
        .select(`
          *,
          fornecedores (
            nome
          )
        `)
        .order('data_vencimento', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const processedData = (data || []).map(c => ({
        ...c,
        status: c.status as 'Pendente' | 'Paga' | 'Vencida' | 'Cancelada'
      }));
      
      setContas(processedData);
    } catch (error: any) {
      console.error('fetchContas error:', error);
      toast.error('Erro ao carregar contas: ' + error.message);
      setContas([]);
    } finally {
      setLoading(false);
    }
  };

  const createConta = async (contaData: CreateContaPagarData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contas_pagar')
        .insert([{
          ...contaData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const processedConta = {
        ...data,
        status: data.status as 'Pendente' | 'Paga' | 'Vencida' | 'Cancelada'
      };

      setContas(prev => [...prev, processedConta]);
      toast.success('Conta a pagar criada com sucesso!');
      return processedConta;
    } catch (error: any) {
      console.error('createConta error:', error);
      toast.error('Erro ao criar conta: ' + error.message);
      throw error;
    }
  };

  const updateConta = async (id: string, contaData: Partial<CreateContaPagarData>) => {
    try {
      const { data, error } = await supabase
        .from('contas_pagar')
        .update(contaData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const processedConta = {
        ...data,
        status: data.status as 'Pendente' | 'Paga' | 'Vencida' | 'Cancelada'
      };

      setContas(prev => prev.map(c => c.id === id ? processedConta : c));
      toast.success('Conta atualizada com sucesso!');
      return processedConta;
    } catch (error: any) {
      console.error('updateConta error:', error);
      toast.error('Erro ao atualizar conta: ' + error.message);
      throw error;
    }
  };

  const deleteConta = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contas_pagar')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setContas(prev => prev.filter(c => c.id !== id));
      toast.success('Conta excluída com sucesso!');
    } catch (error: any) {
      console.error('deleteConta error:', error);
      toast.error('Erro ao excluir conta: ' + error.message);
      throw error;
    }
  };

  const pagarConta = async (id: string, dataPagamento: string, formaPagamento: string) => {
    try {
      const { data, error } = await supabase
        .from('contas_pagar')
        .update({
          data_pagamento: dataPagamento,
          forma_pagamento: formaPagamento,
          status: 'Paga'
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const processedConta = {
        ...data,
        status: data.status as 'Pendente' | 'Paga' | 'Vencida' | 'Cancelada'
      };

      setContas(prev => prev.map(c => c.id === id ? processedConta : c));
      toast.success('Conta marcada como paga!');
      return processedConta;
    } catch (error: any) {
      console.error('pagarConta error:', error);
      toast.error('Erro ao pagar conta: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchContas();
    } else {
      setContas([]);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    contas,
    loading,
    createConta,
    updateConta,
    deleteConta,
    pagarConta,
    refetch: fetchContas
  };
}
