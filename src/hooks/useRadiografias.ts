import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Radiografia {
  id: string;
  user_id: string;
  paciente_id: string;
  titulo: string;
  imagem_base64: string;
  tipo_exame: string | null;
  data_exame: string | null;
  laudo: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateRadiografiaData {
  paciente_id: string;
  titulo: string;
  imagem_base64: string;
  tipo_exame?: string;
  data_exame?: string;
  laudo?: string;
  observacoes?: string;
}

export function useRadiografias(pacienteId?: string) {
  const [radiografias, setRadiografias] = useState<Radiografia[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchRadiografias = async (patientId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("radiografias")
        .select("*")
        .eq("paciente_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRadiografias(data as Radiografia[]);
    } catch (error: any) {
      console.error("Error fetching radiografias:", error);
      toast.error("Erro ao carregar radiografias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && pacienteId) {
      fetchRadiografias(pacienteId);
    } else {
      setLoading(false);
      setRadiografias([]);
    }
  }, [user, pacienteId]);

  const createRadiografia = async (radiografiaData: CreateRadiografiaData) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("radiografias")
        .insert([{
          paciente_id: radiografiaData.paciente_id,
          titulo: radiografiaData.titulo,
          imagem_base64: radiografiaData.imagem_base64,
          tipo_exame: radiografiaData.tipo_exame || null,
          data_exame: radiografiaData.data_exame || null,
          laudo: radiografiaData.laudo || null,
          observacoes: radiografiaData.observacoes || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setRadiografias((prev) => [data as Radiografia, ...prev]);
      toast.success("Radiografia adicionada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error creating radiografia:", error);
      toast.error("Erro ao adicionar radiografia");
      throw error;
    }
  };

  const updateRadiografia = async (
    id: string,
    radiografiaData: Partial<CreateRadiografiaData>
  ) => {
    try {
      const updateData: any = {};
      Object.keys(radiografiaData).forEach((key) => {
        if (radiografiaData[key as keyof CreateRadiografiaData] !== undefined) {
          updateData[key] = radiografiaData[key as keyof CreateRadiografiaData];
        }
      });

      const { data, error } = await supabase
        .from("radiografias")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setRadiografias((prev) =>
        prev.map((radiografia) => (radiografia.id === id ? (data as Radiografia) : radiografia))
      );
      toast.success("Radiografia atualizada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error updating radiografia:", error);
      toast.error("Erro ao atualizar radiografia");
      throw error;
    }
  };

  const deleteRadiografia = async (id: string) => {
    try {
      const { error } = await supabase
        .from("radiografias")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setRadiografias((prev) => prev.filter((radiografia) => radiografia.id !== id));
      toast.success("Radiografia excluída com sucesso!");
    } catch (error: any) {
      console.error("Error deleting radiografia:", error);
      toast.error("Erro ao excluir radiografia");
      throw error;
    }
  };

  const refetch = (patientId: string) => {
    if (user && patientId) {
      fetchRadiografias(patientId);
    }
  };

  return {
    radiografias,
    loading,
    createRadiografia,
    updateRadiografia,
    deleteRadiografia,
    refetch,
  };
}
