import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ManualCodigo {
  id: string;
  tipo: 'Manual' | 'Código de Procedimento' | 'Tabela' | 'Documento';
  titulo: string;
  codigo: string | null;
  descricao: string | null;
  categoria: string;
  conteudo: string | null;
  link_externo: string | null;
  arquivo_base64: string | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export const useManuaisCodigos = () => {
  const { user } = useAuth();
  const [manuais, setManuais] = useState<ManualCodigo[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchManuais = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('manuais_codigos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setManuais((data || []) as ManualCodigo[]);
    } catch (error: any) {
      console.error('Erro ao buscar manuais:', error);
      toast.error('Erro ao carregar manuais e códigos');
    } finally {
      setLoading(false);
    }
  };

  const createManual = async (dados: Omit<ManualCodigo, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('manuais_codigos')
        .insert({
          ...dados,
          user_id: user.id
        });

      if (error) throw error;

      toast.success('Manual/Código cadastrado com sucesso!');
      await fetchManuais();
    } catch (error: any) {
      console.error('Erro ao criar manual:', error);
      toast.error('Erro ao cadastrar manual/código');
    }
  };

  const updateManual = async (id: string, dados: Partial<ManualCodigo>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('manuais_codigos')
        .update(dados)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Manual/Código atualizado com sucesso!');
      await fetchManuais();
    } catch (error: any) {
      console.error('Erro ao atualizar manual:', error);
      toast.error('Erro ao atualizar manual/código');
    }
  };

  const deleteManual = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('manuais_codigos')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Manual/Código excluído com sucesso!');
      await fetchManuais();
    } catch (error: any) {
      console.error('Erro ao excluir manual:', error);
      toast.error('Erro ao excluir manual/código');
    }
  };

  useEffect(() => {
    fetchManuais();
  }, [user]);

  return {
    manuais,
    loading,
    createManual,
    updateManual,
    deleteManual,
    refetch: fetchManuais
  };
};
