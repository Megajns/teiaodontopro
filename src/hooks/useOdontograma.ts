import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface DadosDente {
  numero: number;
  procedimentos: string[];
  observacoes?: string;
}

export interface Odontograma {
  id: string;
  user_id: string;
  paciente_id: string;
  dados_dentes: Record<string, DadosDente>;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateOdontogramaData {
  paciente_id: string;
  dados_dentes?: Record<string, DadosDente>;
  observacoes?: string;
}

export function useOdontograma(pacienteId?: string) {
  const [odontograma, setOdontograma] = useState<Odontograma | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOdontograma = async (patientId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("odontograma")
        .select("*")
        .eq("paciente_id", patientId)
        .maybeSingle();

      if (error) throw error;
      setOdontograma(data as unknown as Odontograma | null);
    } catch (error: any) {
      console.error("Error fetching odontograma:", error);
      toast.error("Erro ao carregar odontograma");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && pacienteId) {
      fetchOdontograma(pacienteId);
    } else {
      setLoading(false);
      setOdontograma(null);
    }
  }, [user, pacienteId]);

  const createOdontograma = async (odontogramaData: CreateOdontogramaData) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("odontograma")
        .insert([{
          paciente_id: odontogramaData.paciente_id,
          dados_dentes: (odontogramaData.dados_dentes || {}) as any,
          observacoes: odontogramaData.observacoes || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setOdontograma(data as unknown as Odontograma);
      toast.success("Odontograma criado com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error creating odontograma:", error);
      toast.error("Erro ao criar odontograma");
      throw error;
    }
  };

  const updateOdontograma = async (
    id: string,
    odontogramaData: Partial<CreateOdontogramaData>
  ) => {
    try {
      const updateData: any = {};
      if (odontogramaData.dados_dentes !== undefined) {
        updateData.dados_dentes = odontogramaData.dados_dentes;
      }
      if (odontogramaData.observacoes !== undefined) {
        updateData.observacoes = odontogramaData.observacoes;
      }

      const { data, error } = await supabase
        .from("odontograma")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setOdontograma(data as unknown as Odontograma);
      toast.success("Odontograma atualizado com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error updating odontograma:", error);
      toast.error("Erro ao atualizar odontograma");
      throw error;
    }
  };

  const deleteOdontograma = async (id: string) => {
    try {
      const { error } = await supabase
        .from("odontograma")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setOdontograma(null);
      toast.success("Odontograma excluído com sucesso!");
    } catch (error: any) {
      console.error("Error deleting odontograma:", error);
      toast.error("Erro ao excluir odontograma");
      throw error;
    }
  };

  const refetch = (patientId: string) => {
    if (user && patientId) {
      fetchOdontograma(patientId);
    }
  };

  return {
    odontograma,
    loading,
    createOdontograma,
    updateOdontograma,
    deleteOdontograma,
    refetch,
  };
}
