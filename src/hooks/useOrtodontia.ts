import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Ortodontia {
  id: string;
  user_id: string;
  paciente_id: string;
  data_inicio: string | null;
  previsao_termino: string | null;
  tipo_aparelho: string | null;
  diagnostico: string | null;
  plano_tratamento: string | null;
  progresso: string | null;
  proxima_consulta: string | null;
  observacoes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateOrtodontiaData {
  paciente_id: string;
  data_inicio?: string;
  previsao_termino?: string;
  tipo_aparelho?: string;
  diagnostico?: string;
  plano_tratamento?: string;
  progresso?: string;
  proxima_consulta?: string;
  observacoes?: string;
  status?: string;
}

export function useOrtodontia(pacienteId?: string) {
  const [ortodontia, setOrtodontia] = useState<Ortodontia | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrtodontia = async (patientId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("ortodontia")
        .select("*")
        .eq("paciente_id", patientId)
        .maybeSingle();

      if (error) throw error;
      setOrtodontia(data as unknown as Ortodontia | null);
    } catch (error: any) {
      console.error("Error fetching ortodontia:", error);
      toast.error("Erro ao carregar dados de ortodontia");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && pacienteId) {
      fetchOrtodontia(pacienteId);
    } else {
      setLoading(false);
      setOrtodontia(null);
    }
  }, [user, pacienteId]);

  const createOrtodontia = async (ortodontiaData: CreateOrtodontiaData) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("ortodontia")
        .insert([{
          paciente_id: ortodontiaData.paciente_id,
          data_inicio: ortodontiaData.data_inicio || null,
          previsao_termino: ortodontiaData.previsao_termino || null,
          tipo_aparelho: ortodontiaData.tipo_aparelho || null,
          diagnostico: ortodontiaData.diagnostico || null,
          plano_tratamento: ortodontiaData.plano_tratamento || null,
          progresso: ortodontiaData.progresso || null,
          proxima_consulta: ortodontiaData.proxima_consulta || null,
          observacoes: ortodontiaData.observacoes || null,
          status: ortodontiaData.status || 'Em Andamento',
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setOrtodontia(data as unknown as Ortodontia);
      toast.success("Tratamento ortodôntico criado com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error creating ortodontia:", error);
      toast.error("Erro ao criar tratamento ortodôntico");
      throw error;
    }
  };

  const updateOrtodontia = async (
    id: string,
    ortodontiaData: Partial<CreateOrtodontiaData>
  ) => {
    try {
      const updateData: any = {};
      Object.keys(ortodontiaData).forEach((key) => {
        if (ortodontiaData[key as keyof CreateOrtodontiaData] !== undefined) {
          updateData[key] = ortodontiaData[key as keyof CreateOrtodontiaData];
        }
      });

      const { data, error } = await supabase
        .from("ortodontia")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setOrtodontia(data as unknown as Ortodontia);
      toast.success("Tratamento ortodôntico atualizado com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error updating ortodontia:", error);
      toast.error("Erro ao atualizar tratamento ortodôntico");
      throw error;
    }
  };

  const deleteOrtodontia = async (id: string) => {
    try {
      const { error } = await supabase
        .from("ortodontia")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setOrtodontia(null);
      toast.success("Tratamento ortodôntico excluído com sucesso!");
    } catch (error: any) {
      console.error("Error deleting ortodontia:", error);
      toast.error("Erro ao excluir tratamento ortodôntico");
      throw error;
    }
  };

  const refetch = (patientId: string) => {
    if (user && patientId) {
      fetchOrtodontia(patientId);
    }
  };

  return {
    ortodontia,
    loading,
    createOrtodontia,
    updateOrtodontia,
    deleteOrtodontia,
    refetch,
  };
}
