import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Foto {
  id: string;
  user_id: string;
  paciente_id: string;
  titulo: string;
  imagem_base64: string;
  tipo: string | null;
  data_foto: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFotoData {
  paciente_id: string;
  titulo: string;
  imagem_base64: string;
  tipo?: string;
  data_foto?: string;
  observacoes?: string;
}

export function useFotos(pacienteId?: string) {
  const [fotos, setFotos] = useState<Foto[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFotos = async (patientId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fotos")
        .select("*")
        .eq("paciente_id", patientId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFotos(data as Foto[]);
    } catch (error: any) {
      console.error("Error fetching fotos:", error);
      toast.error("Erro ao carregar fotos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && pacienteId) {
      fetchFotos(pacienteId);
    } else {
      setLoading(false);
      setFotos([]);
    }
  }, [user, pacienteId]);

  const createFoto = async (fotoData: CreateFotoData) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("fotos")
        .insert([{
          paciente_id: fotoData.paciente_id,
          titulo: fotoData.titulo,
          imagem_base64: fotoData.imagem_base64,
          tipo: fotoData.tipo || null,
          data_foto: fotoData.data_foto || null,
          observacoes: fotoData.observacoes || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setFotos((prev) => [data as Foto, ...prev]);
      toast.success("Foto adicionada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error creating foto:", error);
      toast.error("Erro ao adicionar foto");
      throw error;
    }
  };

  const updateFoto = async (
    id: string,
    fotoData: Partial<CreateFotoData>
  ) => {
    try {
      const updateData: any = {};
      Object.keys(fotoData).forEach((key) => {
        if (fotoData[key as keyof CreateFotoData] !== undefined) {
          updateData[key] = fotoData[key as keyof CreateFotoData];
        }
      });

      const { data, error } = await supabase
        .from("fotos")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setFotos((prev) =>
        prev.map((foto) => (foto.id === id ? (data as Foto) : foto))
      );
      toast.success("Foto atualizada com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error updating foto:", error);
      toast.error("Erro ao atualizar foto");
      throw error;
    }
  };

  const deleteFoto = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fotos")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setFotos((prev) => prev.filter((foto) => foto.id !== id));
      toast.success("Foto excluída com sucesso!");
    } catch (error: any) {
      console.error("Error deleting foto:", error);
      toast.error("Erro ao excluir foto");
      throw error;
    }
  };

  const refetch = (patientId: string) => {
    if (user && patientId) {
      fetchFotos(patientId);
    }
  };

  return {
    fotos,
    loading,
    createFoto,
    updateFoto,
    deleteFoto,
    refetch,
  };
}
