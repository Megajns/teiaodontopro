import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Funcionario {
  id: string;
  user_id: string;
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
  data_admissao: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFuncionarioData {
  nome: string;
  cargo: string;
  telefone: string;
  email: string;
  data_admissao?: string;
  status: string;
}

export function useFuncionarios() {
  const [funcionarios, setFuncionarios] = useState<Funcionario[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFuncionarios = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("funcionarios")
        .select("*")
        .order("nome");

      if (error) {
        console.error("Error fetching funcionarios:", error);
        toast.error("Erro ao carregar funcionários");
        return;
      }

      setFuncionarios(data || []);
    } catch (error) {
      console.error("Error fetching funcionarios:", error);
      toast.error("Erro ao carregar funcionários");
    } finally {
      setLoading(false);
    }
  };

  const createFuncionario = async (funcionarioData: CreateFuncionarioData) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase
        .from("funcionarios")
        .insert([
          {
            ...funcionarioData,
            user_id: user.id,
          },
        ]);

      if (error) {
        console.error("Error creating funcionario:", error);
        toast.error("Erro ao criar funcionário");
        return false;
      }

      toast.success("Funcionário criado com sucesso!");
      await fetchFuncionarios();
      return true;
    } catch (error) {
      console.error("Error creating funcionario:", error);
      toast.error("Erro ao criar funcionário");
      return false;
    }
  };

  const updateFuncionario = async (id: string, funcionarioData: Partial<CreateFuncionarioData>) => {
    try {
      const { error } = await supabase
        .from("funcionarios")
        .update(funcionarioData)
        .eq("id", id);

      if (error) {
        console.error("Error updating funcionario:", error);
        toast.error("Erro ao atualizar funcionário");
        return false;
      }

      toast.success("Funcionário atualizado com sucesso!");
      await fetchFuncionarios();
      return true;
    } catch (error) {
      console.error("Error updating funcionario:", error);
      toast.error("Erro ao atualizar funcionário");
      return false;
    }
  };

  const deleteFuncionario = async (id: string) => {
    try {
      const { error } = await supabase
        .from("funcionarios")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting funcionario:", error);
        toast.error("Erro ao excluir funcionário");
        return false;
      }

      toast.success("Funcionário excluído com sucesso!");
      await fetchFuncionarios();
      return true;
    } catch (error) {
      console.error("Error deleting funcionario:", error);
      toast.error("Erro ao excluir funcionário");
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchFuncionarios();
    }
  }, [user]);

  return {
    funcionarios,
    loading,
    createFuncionario,
    updateFuncionario,
    deleteFuncionario,
    refetch: fetchFuncionarios,
  };
}