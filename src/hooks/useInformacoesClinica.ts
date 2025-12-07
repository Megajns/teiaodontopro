import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface InformacoesClinica {
  id: string;
  user_id: string;
  nome_clinica: string;
  cnpj?: string;
  cro_clinica?: string;
  telefone: string;
  celular?: string;
  email: string;
  website?: string;
  endereco: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep: string;
  logo_base64?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export const useInformacoesClinica = () => {
  const queryClient = useQueryClient();

  const { data: informacoes, isLoading } = useQuery({
    queryKey: ["informacoes-clinica"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("informacoes_clinica")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      return data as InformacoesClinica | null;
    },
  });

  const saveInformacoes = useMutation({
    mutationFn: async (dados: Omit<InformacoesClinica, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      // Verifica se já existe um registro
      const { data: existing } = await supabase
        .from("informacoes_clinica")
        .select("id")
        .eq("user_id", userData.user.id)
        .maybeSingle();

      if (existing) {
        // Update
        const { data, error } = await supabase
          .from("informacoes_clinica")
          .update(dados)
          .eq("id", existing.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        // Insert
        const { data, error } = await supabase
          .from("informacoes_clinica")
          .insert([{ ...dados, user_id: userData.user.id }])
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["informacoes-clinica"] });
      toast({
        title: "Informações salvas",
        description: "As informações da clínica foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    informacoes,
    isLoading,
    saveInformacoes: saveInformacoes.mutate,
    isSaving: saveInformacoes.isPending,
  };
};
