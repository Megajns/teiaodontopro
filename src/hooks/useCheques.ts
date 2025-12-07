import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type Cheque = {
  id: string;
  user_id: string;
  numero_cheque: string;
  banco: string;
  agencia: string;
  conta: string;
  emitente: string;
  cpf_cnpj?: string;
  valor: number;
  data_emissao: string;
  data_vencimento: string;
  data_compensacao?: string;
  status: "A Compensar" | "Compensado" | "Devolvido" | "Cancelado";
  observacoes?: string;
  created_at: string;
  updated_at: string;
};

export function useCheques() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: cheques = [], isLoading } = useQuery({
    queryKey: ["cheques"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("cheques")
        .select("*")
        .order("data_vencimento", { ascending: true });

      if (error) throw error;
      return data as Cheque[];
    },
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<Cheque, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: result, error } = await supabase
        .from("cheques")
        .insert([{ ...data, user_id: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cheques"] });
      toast({
        title: "Sucesso",
        description: "Cheque cadastrado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar cheque: " + error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Cheque> & { id: string }) => {
      const { data: result, error } = await supabase
        .from("cheques")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cheques"] });
      toast({
        title: "Sucesso",
        description: "Cheque atualizado com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar cheque: " + error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("cheques")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cheques"] });
      toast({
        title: "Sucesso",
        description: "Cheque excluído com sucesso!",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir cheque: " + error.message,
        variant: "destructive",
      });
    },
  });

  return {
    cheques,
    isLoading,
    createCheque: createMutation.mutateAsync,
    updateCheque: updateMutation.mutateAsync,
    deleteCheque: deleteMutation.mutateAsync,
  };
}
