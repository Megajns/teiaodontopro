import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Patrimonio {
  id: string;
  user_id: string;
  item: string;
  codigo: string;
  categoria: string;
  valor: number;
  data_aquisicao: string;
  status: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface PatrimonioInput {
  item: string;
  codigo: string;
  categoria: string;
  valor: number;
  data_aquisicao: string;
  status: string;
  observacoes?: string;
}

export function usePatrimonio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: patrimonios = [], isLoading } = useQuery({
    queryKey: ["patrimonio", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("patrimonio")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Patrimonio[];
    },
    enabled: !!user?.id,
  });

  const createPatrimonio = useMutation({
    mutationFn: async (input: PatrimonioInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("patrimonio")
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrimonio"] });
      toast({
        title: "Patrimônio cadastrado",
        description: "O item foi cadastrado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o item.",
        variant: "destructive",
      });
    },
  });

  const updatePatrimonio = useMutation({
    mutationFn: async ({ id, ...input }: PatrimonioInput & { id: string }) => {
      const { data, error } = await supabase
        .from("patrimonio")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrimonio"] });
      toast({
        title: "Patrimônio atualizado",
        description: "O item foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o item.",
        variant: "destructive",
      });
    },
  });

  const deletePatrimonio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("patrimonio").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patrimonio"] });
      toast({
        title: "Patrimônio excluído",
        description: "O item foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o item.",
        variant: "destructive",
      });
    },
  });

  return {
    patrimonios,
    isLoading,
    createPatrimonio,
    updatePatrimonio,
    deletePatrimonio,
  };
}
