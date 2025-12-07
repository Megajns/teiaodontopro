import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Honorario {
  id: string;
  procedimento: string;
  codigo: string;
  categoria: string;
  valor_particular: number;
  valor_convenio: number;
  duracao_media: number;
  status: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export const useHonorarios = () => {
  const [honorarios, setHonorarios] = useState<Honorario[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchHonorarios = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase
        .from("honorarios")
        .select("*")
        .eq("user_id", user.id)
        .order("procedimento", { ascending: true });

      if (error) throw error;
      setHonorarios(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar honorários",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createHonorario = async (honorario: Omit<Honorario, "id" | "created_at" | "updated_at">) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase
        .from("honorarios")
        .insert([{ ...honorario, user_id: user.id }]);

      if (error) throw error;

      toast({
        title: "Honorário cadastrado",
        description: "Procedimento cadastrado com sucesso!",
      });

      await fetchHonorarios();
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar honorário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateHonorario = async (id: string, honorario: Partial<Honorario>) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("honorarios")
        .update(honorario)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Honorário atualizado",
        description: "Procedimento atualizado com sucesso!",
      });

      await fetchHonorarios();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar honorário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const deleteHonorario = async (id: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("honorarios")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Honorário excluído",
        description: "Procedimento excluído com sucesso!",
      });

      await fetchHonorarios();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir honorário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    honorarios,
    loading,
    fetchHonorarios,
    createHonorario,
    updateHonorario,
    deleteHonorario,
  };
};
