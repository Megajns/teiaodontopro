import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Medicamento {
  nome: string;
  dosagem: string;
  frequencia: string;
  duracao: string;
  observacoes?: string;
}

export interface Receituario {
  id: string;
  user_id: string;
  paciente_id: string;
  data_prescricao: string;
  medicamentos: Medicamento[];
  diagnostico: string | null;
  observacoes: string | null;
  validade: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateReceituarioData {
  paciente_id: string;
  data_prescricao: string;
  medicamentos: Medicamento[];
  diagnostico?: string;
  observacoes?: string;
  validade?: string;
}

export function useReceituario(pacienteId?: string) {
  const [receituarios, setReceituarios] = useState<Receituario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReceituarios = async (patientId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("receituario")
        .select("*")
        .eq("paciente_id", patientId)
        .order("data_prescricao", { ascending: false });

      if (error) throw error;
      setReceituarios(data as unknown as Receituario[]);
    } catch (error: any) {
      console.error("Error fetching receituarios:", error);
      toast.error("Erro ao carregar receituários");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && pacienteId) {
      fetchReceituarios(pacienteId);
    } else {
      setLoading(false);
      setReceituarios([]);
    }
  }, [user, pacienteId]);

  const createReceituario = async (receituarioData: CreateReceituarioData) => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return;
      }

      const { data, error } = await supabase
        .from("receituario")
        .insert([{
          paciente_id: receituarioData.paciente_id,
          data_prescricao: receituarioData.data_prescricao,
          medicamentos: receituarioData.medicamentos as any,
          diagnostico: receituarioData.diagnostico || null,
          observacoes: receituarioData.observacoes || null,
          validade: receituarioData.validade || null,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      setReceituarios((prev) => [data as unknown as Receituario, ...prev]);
      toast.success("Receituário criado com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error creating receituario:", error);
      toast.error("Erro ao criar receituário");
      throw error;
    }
  };

  const updateReceituario = async (
    id: string,
    receituarioData: Partial<CreateReceituarioData>
  ) => {
    try {
      const updateData: any = {};
      Object.keys(receituarioData).forEach((key) => {
        if (receituarioData[key as keyof CreateReceituarioData] !== undefined) {
          updateData[key] = receituarioData[key as keyof CreateReceituarioData];
        }
      });

      const { data, error } = await supabase
        .from("receituario")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setReceituarios((prev) =>
        prev.map((receituario) => (receituario.id === id ? (data as unknown as Receituario) : receituario))
      );
      toast.success("Receituário atualizado com sucesso!");
      return data;
    } catch (error: any) {
      console.error("Error updating receituario:", error);
      toast.error("Erro ao atualizar receituário");
      throw error;
    }
  };

  const deleteReceituario = async (id: string) => {
    try {
      const { error } = await supabase
        .from("receituario")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setReceituarios((prev) => prev.filter((receituario) => receituario.id !== id));
      toast.success("Receituário excluído com sucesso!");
    } catch (error: any) {
      console.error("Error deleting receituario:", error);
      toast.error("Erro ao excluir receituário");
      throw error;
    }
  };

  const refetch = (patientId: string) => {
    if (user && patientId) {
      fetchReceituarios(patientId);
    }
  };

  return {
    receituarios,
    loading,
    createReceituario,
    updateReceituario,
    deleteReceituario,
    refetch,
  };
}
