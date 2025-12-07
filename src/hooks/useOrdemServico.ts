import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Procedimento {
  descricao: string;
  valor: number;
  dente?: string;
}

export interface OrdemServico {
  id: string;
  user_id: string;
  numero_os: string;
  paciente_id: string;
  dentista_id: string;
  data_abertura: string;
  data_prevista: string | null;
  data_conclusao: string | null;
  procedimentos: Procedimento[];
  valor_total: number;
  status: string;
  prioridade: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOrdemServicoData {
  paciente_id: string;
  dentista_id: string;
  data_abertura?: string;
  data_prevista?: string;
  data_conclusao?: string;
  procedimentos: Procedimento[];
  valor_total: number;
  status?: string;
  prioridade?: string;
  observacoes?: string;
}

export function useOrdemServico() {
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrdensServico = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ordem_servico")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrdensServico(data as unknown as OrdemServico[]);
    } catch (error: any) {
      console.error("Error fetching ordens de servico:", error);
      toast.error("Erro ao carregar ordens de serviço");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrdensServico();
    } else {
      setLoading(false);
      setOrdensServico([]);
    }
  }, [user]);

  const createOrdemServico = async (osData: CreateOrdemServicoData) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("ordem_servico")
        .insert([{
          paciente_id: osData.paciente_id,
          dentista_id: osData.dentista_id,
          data_abertura: osData.data_abertura || new Date().toISOString().split('T')[0],
          data_prevista: osData.data_prevista || null,
          data_conclusao: osData.data_conclusao || null,
          procedimentos: osData.procedimentos as any,
          valor_total: osData.valor_total,
          status: osData.status || 'Aberta',
          prioridade: osData.prioridade || 'Normal',
          observacoes: osData.observacoes || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setOrdensServico((prev) => [data as unknown as OrdemServico, ...prev]);
      toast.success("Ordem de serviço criada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error creating ordem servico:", error);
      toast.error("Erro ao criar ordem de serviço");
      throw error;
    }
  };

  const updateOrdemServico = async (
    id: string,
    osData: Partial<CreateOrdemServicoData>
  ) => {
    try {
      const updateData: any = {};
      Object.keys(osData).forEach((key) => {
        if (osData[key as keyof CreateOrdemServicoData] !== undefined) {
          updateData[key] = osData[key as keyof CreateOrdemServicoData];
        }
      });

      const { data, error } = await supabase
        .from("ordem_servico")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setOrdensServico((prev) =>
        prev.map((os) => (os.id === id ? (data as unknown as OrdemServico) : os))
      );
      toast.success("Ordem de serviço atualizada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error updating ordem servico:", error);
      toast.error("Erro ao atualizar ordem de serviço");
      throw error;
    }
  };

  const deleteOrdemServico = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ordem_servico")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setOrdensServico((prev) => prev.filter((os) => os.id !== id));
      toast.success("Ordem de serviço excluída com sucesso!");
    } catch (error: any) {
      console.error("Error deleting ordem servico:", error);
      toast.error("Erro ao excluir ordem de serviço");
      throw error;
    }
  };

  return {
    ordensServico,
    loading,
    createOrdemServico,
    updateOrdemServico,
    deleteOrdemServico,
    refetch: fetchOrdensServico,
  };
}
