import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type FluxoCaixa = {
  id: string;
  user_id: string;
  tipo: "Entrada" | "Saída";
  descricao: string;
  categoria: string;
  valor: number;
  data_movimentacao: string;
  forma_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
};

export function useFluxoCaixa() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: movimentacoes = [], isLoading } = useQuery({
    queryKey: ["fluxo_caixa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fluxo_caixa")
        .select("*")
        .order("data_movimentacao", { ascending: false });

      if (error) throw error;
      return data as FluxoCaixa[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<FluxoCaixa, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("fluxo_caixa")
        .insert([{ ...data, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fluxo_caixa"] });
      toast({
        title: "Sucesso",
        description: "Movimentação cadastrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar movimentação: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<FluxoCaixa> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("fluxo_caixa")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fluxo_caixa"] });
      toast({
        title: "Sucesso",
        description: "Movimentação atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar movimentação: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("fluxo_caixa")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fluxo_caixa"] });
      toast({
        title: "Sucesso",
        description: "Movimentação excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir movimentação: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    movimentacoes,
    isLoading,
    createMovimentacao: createMutation.mutateAsync,
    updateMovimentacao: updateMutation.mutateAsync,
    deleteMovimentacao: deleteMutation.mutateAsync,
  };
}
