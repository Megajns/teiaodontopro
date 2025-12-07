import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type Comissao = {
  id: string;
  user_id: string;
  dentista_id: string;
  referencia: string;
  valor_total_procedimentos: number;
  percentual_comissao: number;
  valor_comissao: number;
  data_inicio: string;
  data_fim: string;
  status: "Pendente" | "Paga" | "Cancelada";
  data_pagamento?: string;
  forma_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
};

export function useComissoes() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: comissoes = [], isLoading } = useQuery({
    queryKey: ["comissoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comissoes")
        .select("*")
        .order("data_inicio", { ascending: false });

      if (error) throw error;
      return data as Comissao[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Comissao, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("comissoes")
        .insert([{ ...data, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comissoes"] });
      toast({
        title: "Sucesso",
        description: "Comissão cadastrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar comissão: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Comissao> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("comissoes")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comissoes"] });
      toast({
        title: "Sucesso",
        description: "Comissão atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar comissão: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("comissoes")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comissoes"] });
      toast({
        title: "Sucesso",
        description: "Comissão excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir comissão: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    comissoes,
    isLoading,
    createComissao: createMutation.mutateAsync,
    updateComissao: updateMutation.mutateAsync,
    deleteComissao: deleteMutation.mutateAsync,
  };
}
