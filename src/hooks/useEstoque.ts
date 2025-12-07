import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Estoque {
  id: string;
  user_id: string;
  item: string;
  codigo: string;
  categoria: string;
  estoque: number;
  minimo: number;
  maximo: number;
  valor_unitario: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface EstoqueInput {
  item: string;
  codigo: string;
  categoria: string;
  estoque: number;
  minimo: number;
  maximo: number;
  valor_unitario: number;
  observacoes?: string;
}

export function useEstoque() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: estoques = [], isLoading } = useQuery({
    queryKey: ["estoque", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("estoque")
        .select("*")
        .eq("user_id", user.id)
        .order("item", { ascending: true });

      if (error) throw error;
      return data as Estoque[];
    },
    enabled: !!user?.id,
  });

  const createEstoque = useMutation({
    mutationFn: async (input: EstoqueInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("estoque")
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoque"] });
      toast({
        title: "Item cadastrado",
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

  const updateEstoque = useMutation({
    mutationFn: async ({ id, ...input }: EstoqueInput & { id: string }) => {
      const { data, error } = await supabase
        .from("estoque")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoque"] });
      toast({
        title: "Item atualizado",
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

  const deleteEstoque = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("estoque").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["estoque"] });
      toast({
        title: "Item excluído",
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
    estoques,
    isLoading,
    createEstoque,
    updateEstoque,
    deleteEstoque,
  };
}
