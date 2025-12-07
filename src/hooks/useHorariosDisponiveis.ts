import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface HorarioDisponivel {
  id: string;
  user_id: string;
  dia_semana: number;
  hora: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useHorariosDisponiveis = () => {
  const queryClient = useQueryClient();

  const { data: horarios = [], isLoading } = useQuery({
    queryKey: ["horarios-disponiveis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("horarios_disponiveis")
        .select("*")
        .order("dia_semana", { ascending: true })
        .order("hora", { ascending: true });

      if (error) throw error;
      return data as HorarioDisponivel[];
    },
  });

  const createHorario = useMutation({
    mutationFn: async (horario: { dia_semana: number; hora: string; ativo: boolean }) => {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("horarios_disponiveis")
        .insert([{ ...horario, user_id: userData.user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horarios-disponiveis"] });
      toast({
        title: "Horário criado",
        description: "O horário foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao criar horário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateHorario = useMutation({
    mutationFn: async ({ id, ...horario }: Partial<HorarioDisponivel> & { id: string }) => {
      const { data, error } = await supabase
        .from("horarios_disponiveis")
        .update(horario)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horarios-disponiveis"] });
      toast({
        title: "Horário atualizado",
        description: "O horário foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar horário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteHorario = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("horarios_disponiveis")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["horarios-disponiveis"] });
      toast({
        title: "Horário excluído",
        description: "O horário foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir horário",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    horarios,
    isLoading,
    createHorario: createHorario.mutate,
    updateHorario: updateHorario.mutate,
    deleteHorario: deleteHorario.mutate,
  };
};
