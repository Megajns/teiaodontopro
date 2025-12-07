import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface Fornecedor {
  id: string;
  user_id: string;
  nome: string;
  cnpj: string | null;
  contato: string;
  telefone: string;
  email: string;
  endereco: string | null;
  categoria: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFornecedorData {
  nome: string;
  cnpj?: string;
  contato: string;
  telefone: string;
  email: string;
  endereco?: string;
  categoria: string;
  status: string;
}

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchFornecedores = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("fornecedores")
        .select("*")
        .order("nome");

      if (error) {
        console.error("Error fetching fornecedores:", error);
        toast.error("Erro ao carregar fornecedores");
        return;
      }

      setFornecedores(data || []);
    } catch (error) {
      console.error("Error fetching fornecedores:", error);
      toast.error("Erro ao carregar fornecedores");
    } finally {
      setLoading(false);
    }
  };

  const createFornecedor = async (fornecedorData: CreateFornecedorData) => {
    if (!user) {
      toast.error("Usuário não autenticado");
      return false;
    }

    try {
      const { error } = await supabase
        .from("fornecedores")
        .insert([
          {
            ...fornecedorData,
            user_id: user.id,
          },
        ]);

      if (error) {
        console.error("Error creating fornecedor:", error);
        toast.error("Erro ao criar fornecedor");
        return false;
      }

      toast.success("Fornecedor criado com sucesso!");
      await fetchFornecedores();
      return true;
    } catch (error) {
      console.error("Error creating fornecedor:", error);
      toast.error("Erro ao criar fornecedor");
      return false;
    }
  };

  const updateFornecedor = async (id: string, fornecedorData: Partial<CreateFornecedorData>) => {
    try {
      const { error } = await supabase
        .from("fornecedores")
        .update(fornecedorData)
        .eq("id", id);

      if (error) {
        console.error("Error updating fornecedor:", error);
        toast.error("Erro ao atualizar fornecedor");
        return false;
      }

      toast.success("Fornecedor atualizado com sucesso!");
      await fetchFornecedores();
      return true;
    } catch (error) {
      console.error("Error updating fornecedor:", error);
      toast.error("Erro ao atualizar fornecedor");
      return false;
    }
  };

  const deleteFornecedor = async (id: string) => {
    try {
      const { error } = await supabase
        .from("fornecedores")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Error deleting fornecedor:", error);
        toast.error("Erro ao excluir fornecedor");
        return false;
      }

      toast.success("Fornecedor excluído com sucesso!");
      await fetchFornecedores();
      return true;
    } catch (error) {
      console.error("Error deleting fornecedor:", error);
      toast.error("Erro ao excluir fornecedor");
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchFornecedores();
    }
  }, [user]);

  return {
    fornecedores,
    loading,
    createFornecedor,
    updateFornecedor,
    deleteFornecedor,
    refetch: fetchFornecedores,
  };
}