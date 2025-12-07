import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type ContaReceber = {
  id: string;
  user_id: string;
  paciente_id?: string;
  descricao: string;
  categoria: string;
  valor: number;
  data_vencimento: string;
  data_recebimento?: string;
  status: "Pendente" | "Recebida" | "Vencida" | "Cancelada";
  forma_pagamento?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
};

export function useContasReceber() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: contasReceber = [], isLoading } = useQuery({
    queryKey: ["contas_receber"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_receber")
        .select("*")
        .order("data_vencimento", { ascending: false });

      if (error) throw error;
      return data as ContaReceber[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<ContaReceber, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("contas_receber")
        .insert([{ ...data, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas_receber"] });
      toast({
        title: "Sucesso",
        description: "Conta a receber cadastrada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar conta a receber: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<ContaReceber> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("contas_receber")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas_receber"] });
      toast({
        title: "Sucesso",
        description: "Conta a receber atualizada com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar conta a receber: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contas_receber")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas_receber"] });
      toast({
        title: "Sucesso",
        description: "Conta a receber excluída com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir conta a receber: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    contasReceber,
    isLoading,
    createConta: createMutation.mutateAsync,
    updateConta: updateMutation.mutateAsync,
    deleteConta: deleteMutation.mutateAsync,
  };
}
