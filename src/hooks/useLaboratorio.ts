import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Laboratorio {
  id: string;
  user_id: string;
  paciente: string;
  procedimento: string;
  laboratorio: string;
  data_envio: string;
  data_retorno: string;
  status: string;
  valor: number;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface LaboratorioInput {
  paciente: string;
  procedimento: string;
  laboratorio: string;
  data_envio: string;
  data_retorno: string;
  status: string;
  valor: number;
  observacoes?: string;
}

export function useLaboratorio() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: laboratorios = [], isLoading } = useQuery({
    queryKey: ["laboratorio", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from("laboratorio")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Laboratorio[];
    },
    enabled: !!user?.id,
  });

  const createLaboratorio = useMutation({
    mutationFn: async (input: LaboratorioInput) => {
      if (!user?.id) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("laboratorio")
        .insert([{ ...input, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laboratorio"] });
      toast({
        title: "Serviço cadastrado",
        description: "O serviço foi cadastrado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao cadastrar",
        description: "Não foi possível cadastrar o serviço.",
        variant: "destructive",
      });
    },
  });

  const updateLaboratorio = useMutation({
    mutationFn: async ({ id, ...input }: LaboratorioInput & { id: string }) => {
      const { data, error } = await supabase
        .from("laboratorio")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laboratorio"] });
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o serviço.",
        variant: "destructive",
      });
    },
  });

  const deleteLaboratorio = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("laboratorio").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["laboratorio"] });
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o serviço.",
        variant: "destructive",
      });
    },
  });

  return {
    laboratorios,
    isLoading,
    createLaboratorio,
    updateLaboratorio,
    deleteLaboratorio,
  };
}
