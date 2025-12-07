import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface FichaClinica {
  id: string;
  user_id: string;
  paciente_id: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
  queixa_principal?: string;
  historico_medico?: string;
  alergias?: string;
  pressao_arterial?: string;
  temperatura?: string;
  peso?: string;
  exame_extraoral?: string;
  exame_intraoral?: string;
  diagnostico?: string;
  plano_tratamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface FichaClinicaInput {
  paciente_id: string;
  contato_emergencia_nome?: string;
  contato_emergencia_telefone?: string;
  contato_emergencia_parentesco?: string;
  queixa_principal?: string;
  historico_medico?: string;
  alergias?: string;
  pressao_arterial?: string;
  temperatura?: string;
  peso?: string;
  exame_extraoral?: string;
  exame_intraoral?: string;
  diagnostico?: string;
  plano_tratamento?: string;
  observacoes?: string;
}

export function useFichaClinica(pacienteId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: fichaClinica, isLoading } = useQuery({
    queryKey: ["ficha_clinica", pacienteId],
    queryFn: async () => {
      if (!user?.id || !pacienteId) return null;

      const { data, error } = await supabase
        .from("ficha_clinica")
        .select("*")
        .eq("user_id", user.id)
        .eq("paciente_id", pacienteId)
        .maybeSingle();

      if (error) throw error;
      return data as FichaClinica | null;
    },
    enabled: !!user?.id && !!pacienteId,
  });

  const saveFichaClinica = useMutation({
    mutationFn: async (input: FichaClinicaInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      // Check if ficha already exists
      const { data: existing } = await supabase
        .from("ficha_clinica")
        .select("id")
        .eq("user_id", user.id)
        .eq("paciente_id", input.paciente_id)
        .maybeSingle();

      if (existing) {
        // Update existing
        const { data, error } = await supabase
          .from("ficha_clinica")
          .update(input)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Create new
        const { data, error } = await supabase
          .from("ficha_clinica")
          .insert([{ ...input, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ficha_clinica"] });
      toast({
        title: "Ficha salva",
        description: "A ficha clínica foi salva com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar a ficha clínica.",
        variant: "destructive",
      });
    },
  });

  return {
    fichaClinica,
    isLoading,
    saveFichaClinica,
  };
}
