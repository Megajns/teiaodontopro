import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Dentista {
  id: string;
  user_id: string;
  nome: string;
  cro: string;
  especialidade: string;
  telefone: string;
  email: string;
  cpf: string;
  endereco?: string;
  data_nascimento?: string;
  status: 'Ativo' | 'Inativo';
  created_at: string;
  updated_at: string;
}

export interface CreateDentistaData {
  nome: string;
  cro: string;
  especialidade: string;
  telefone: string;
  email: string;
  cpf: string;
  endereco?: string;
  data_nascimento?: string;
  status: 'Ativo' | 'Inativo';
}

export function useDentistas() {
  const [dentistas, setDentistas] = useState<Dentista[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchDentistas = async () => {
    if (!user) {
      console.log('fetchDentistas: no user, returning');
      setDentistas([]);
      return;
    }
    
    try {
      console.log('fetchDentistas: starting fetch for user:', user.id);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('dentistas')
        .select('*')
        .order('nome');

      console.log('fetchDentistas result:', { data, error });
      
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const processedData = (data || []).map(d => ({
        ...d,
        status: d.status as 'Ativo' | 'Inativo'
      }));
      
      console.log('Processed data:', processedData);
      setDentistas(processedData);
      console.log('fetchDentistas: dentistas set successfully');
    } catch (error: any) {
      console.error('fetchDentistas error:', error);
      toast.error('Erro ao carregar dentistas: ' + error.message);
      setDentistas([]);
    } finally {
      setLoading(false);
      console.log('fetchDentistas: loading set to false');
    }
  };

  const createDentista = async (dentistaData: CreateDentistaData) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('dentistas')
        .insert([{
          ...dentistaData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDentistas();
      toast.success('Dentista cadastrado com sucesso!');
      return data;
    } catch (error: any) {
      toast.error('Erro ao cadastrar dentista: ' + error.message);
      return null;
    }
  };

  const updateDentista = async (id: string, dentistaData: Partial<CreateDentistaData>) => {
    try {
      const { error } = await supabase
        .from('dentistas')
        .update(dentistaData)
        .eq('id', id);

      if (error) throw error;
      
      await fetchDentistas();
      toast.success('Dentista atualizado com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao atualizar dentista: ' + error.message);
      return false;
    }
  };

  const deleteDentista = async (id: string) => {
    try {
      const { error } = await supabase
        .from('dentistas')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchDentistas();
      toast.success('Dentista removido com sucesso!');
      return true;
    } catch (error: any) {
      toast.error('Erro ao remover dentista: ' + error.message);
      return false;
    }
  };

  // Carregar dados quando o usuário estiver disponível
  useEffect(() => {
    if (user) {
      console.log('useEffect triggered, user:', user.id);
      fetchDentistas();
    } else {
      console.log('useEffect: no user, clearing data');
      setDentistas([]);
      setLoading(false);
    }
  }, [user?.id]); // Dependência específica no ID do usuário

  return {
    dentistas,
    loading,
    createDentista,
    updateDentista,
    deleteDentista,
    refetch: fetchDentistas
  };
}