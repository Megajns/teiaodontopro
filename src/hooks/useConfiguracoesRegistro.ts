import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export interface ConfiguracoesRegistro {
  id: string;
  user_id: string;
  permitir_registro: boolean;
  created_at: string;
  updated_at: string;
}

export const useConfiguracoesRegistro = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: configuracoes, isLoading } = useQuery({
    queryKey: ["configuracoes-registro", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from("configuracoes_sistema")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar configurações:", error);
        throw error;
      }

      // Se não existe configuração, criar uma
      if (!data) {
        const { data: newConfig, error: createError } = await supabase
          .from("configuracoes_sistema")
          .insert({
            user_id: user.id,
            permitir_registro: true,
          })
          .select()
          .single();

        if (createError) {
          console.error("Erro ao criar configuração:", createError);
          throw createError;
        }

        return newConfig;
      }

      return data;
    },
    enabled: !!user?.id,
  });

  const updateConfiguracoesMutation = useMutation({
    mutationFn: async (permitirRegistro: boolean) => {
      if (!user?.id) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("configuracoes_sistema")
        .update({ permitir_registro: permitirRegistro })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["configuracoes-registro"] });
      toast({
        title: "Configurações atualizadas",
        description: "As configurações de registro foram salvas com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar configurações:", error);
      toast({
        title: "Erro ao atualizar configurações",
        description: "Não foi possível salvar as configurações. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  return {
    configuracoes,
    isLoading,
    updateConfiguracoes: updateConfiguracoesMutation.mutate,
    isUpdating: updateConfiguracoesMutation.isPending,
  };
};
