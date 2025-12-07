import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Convenio {
  id: string;
  user_id: string;
  nome: string;
  codigo: string | null;
  tipo: string;
  percentual_cobertura: number | null;
  valor_consulta: number | null;
  carencia_dias: number;
  observacoes: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateConvenioData {
  nome: string;
  codigo?: string;
  tipo: string;
  percentual_cobertura?: number;
  valor_consulta?: number;
  carencia_dias: number;
  observacoes?: string;
  status: string;
}

export function useConvenios() {
  const [convenios, setConvenios] = useState<Convenio[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchConvenios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("convenios")
        .select("*")
        .order("nome");

      if (error) {
        console.error("Error fetching convenios:", error);
        toast({
          title: "Erro",
          description: "Erro ao carregar convênios",
          variant: "destructive",
        });
        return;
      }

      setConvenios(data || []);
    } catch (error) {
      console.error("Error fetching convenios:", error);
      toast({
        title: "Erro",
        description: "Erro ao carregar convênios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createConvenio = async (convenioData: CreateConvenioData) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    try {
      const { error } = await supabase
        .from("convenios")
        .insert([
          {
            ...convenioData,
            user_id: user.id,
          },
        ]);

      if (error) {
        console.error("Error creating convenio:", error);
        toast({
          title: "Erro",
          description: "Erro ao criar convênio",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Convênio criado com sucesso!",
      });
      await fetchConvenios();
      return true;
    } catch (error) {
      console.error("Error creating convenio:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar convênio",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateConvenio = async (id: string, convenioData: Partial<CreateConvenioData>) => {
    try {
      const { error } = await supabase
        .from("convenios")
        .update(convenioData)
        .eq("id", id);

      if (error) {
        console.error("Error updating convenio:", error);
        toast({
          title: "Erro",
          description: "Erro ao atualizar convênio",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Convênio atualizado com sucesso!",
      });
      await fetchConvenios();
      return true;
    } catch (error) {
      console.error("Error updating convenio:", error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar convênio",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteConvenio = async (id: string) => {
    try {
      const { error } = await supabase
        .from("convenios")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting convenio:", error);
        toast({
          title: "Erro",
          description: "Erro ao excluir convênio",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Sucesso",
        description: "Convênio excluído com sucesso!",
      });
      await fetchConvenios();
      return true;
    } catch (error) {
      console.error("Error deleting convenio:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir convênio",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchConvenios();
    }
  }, [user]);

  return {
    convenios,
    loading,
    createConvenio,
    updateConvenio,
    deleteConvenio,
    refetch: fetchConvenios,
  };
}