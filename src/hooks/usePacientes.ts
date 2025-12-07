import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Paciente {
  id: string;
  user_id: string;
  nome: string;
  email: string;
  telefone: string;
  data_nascimento?: string;
  ultima_consulta?: string;
  status: 'Ativo' | 'Inativo';
  endereco?: string;
  cpf?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePacienteData {
  nome: string;
  email: string;
  telefone: string;
  data_nascimento?: string;
  ultima_consulta?: string;
  status: 'Ativo' | 'Inativo';
  endereco?: string;
  cpf?: string;
}

export function usePacientes() {
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchPacientes = async () => {
    if (!user) {
      setPacientes([]);
      return;
    }
    
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'Ativo')
        .order('nome');

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const processedData = (data || []).map(p => ({
        ...p,
        status: p.status as 'Ativo' | 'Inativo'
      }));
      
      setPacientes(processedData);
    } catch (error: any) {
      console.error('fetchPacientes error:', error);
      toast.error('Erro ao carregar pacientes: ' + error.message);
      setPacientes([]);
    } finally {
      setLoading(false);
    }
  };

  const createPaciente = async (pacienteData: CreatePacienteData) => {
    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{
          ...pacienteData,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      const processedPaciente = {
        ...data,
        status: data.status as 'Ativo' | 'Inativo'
      };
      setPacientes(prev => [...prev, processedPaciente]);
      toast.success('Paciente criado com sucesso!');
      return processedPaciente;
    } catch (error: any) {
      console.error('createPaciente error:', error);
      toast.error('Erro ao criar paciente: ' + error.message);
      throw error;
    }
  };

  const updatePaciente = async (id: string, pacienteData: Partial<CreatePacienteData>) => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .update(pacienteData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const processedPaciente = {
        ...data,
        status: data.status as 'Ativo' | 'Inativo'
      };
      setPacientes(prev => prev.map(p => p.id === id ? processedPaciente : p));
      toast.success('Paciente atualizado com sucesso!');
      return processedPaciente;
    } catch (error: any) {
      console.error('updatePaciente error:', error);
      toast.error('Erro ao atualizar paciente: ' + error.message);
      throw error;
    }
  };

  const deletePaciente = async (id: string) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPacientes(prev => prev.filter(p => p.id !== id));
      toast.success('Paciente excluído com sucesso!');
    } catch (error: any) {
      console.error('deletePaciente error:', error);
      toast.error('Erro ao excluir paciente: ' + error.message);
      throw error;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPacientes();
    } else {
      setPacientes([]);
      setLoading(false);
    }
  }, [user?.id]);

  return {
    pacientes,
    loading,
    createPaciente,
    updatePaciente,
    deletePaciente,
    refetch: fetchPacientes
  };
}