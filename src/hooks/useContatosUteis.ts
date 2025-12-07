import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ContatoUtil {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  categoria: string;
  tipo?: string;
  email?: string;
  endereco?: string;
  horario_funcionamento?: string;
  observacoes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useContatosUteis = () => {
  const queryClient = useQueryClient();

  const { data: contatos = [], isLoading } = useQuery({
    queryKey: ["contatos-uteis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contatos_uteis")
        .select("*")
        .order("categoria", { ascending: true })
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as ContatoUtil[];
    },
  });

  const createContato = useMutation({
    mutationFn: async (contato: Omit<ContatoUtil, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("contatos_uteis")
        .insert([{ ...contato, user_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatos-uteis"] });
      toast({
        title: "Contato criado",
        description: "O contato foi criado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar contato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateContato = useMutation({
    mutationFn: async ({ id, ...contato }: Partial<ContatoUtil> & { id: string }) => {
      const { data, error } = await supabase
        .from("contatos_uteis")
        .update(contato)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatos-uteis"] });
      toast({
        title: "Contato atualizado",
        description: "O contato foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar contato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteContato = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contatos_uteis")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contatos-uteis"] });
      toast({
        title: "Contato excluído",
        description: "O contato foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir contato",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    contatos,
    isLoading,
    createContato: createContato.mutate,
    updateContato: updateContato.mutate,
    deleteContato: deleteContato.mutate,
  };
};
