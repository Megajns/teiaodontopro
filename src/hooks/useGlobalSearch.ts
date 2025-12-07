import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SearchResult {
  id: string;
  type: "paciente" | "agendamento";
  title: string;
  subtitle?: string;
  data?: any;
}

export const useGlobalSearch = (query: string) => {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const searchData = async () => {
      if (!query || query.length < 2 || !user?.id) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const searchTerm = `%${query}%`;

        // Buscar pacientes
        const { data: pacientes } = await supabase
          .from("pacientes")
          .select("*")
          .eq("user_id", user.id)
          .or(`nome.ilike.${searchTerm},cpf.ilike.${searchTerm},telefone.ilike.${searchTerm}`)
          .limit(5);

        // Buscar agendamentos com informações do paciente
        const { data: agendamentos } = await supabase
          .from("agendamentos")
          .select("*")
          .eq("user_id", user.id)
          .or(`procedimento.ilike.${searchTerm},observacoes.ilike.${searchTerm}`)
          .limit(5);

        const searchResults: SearchResult[] = [];

        // Adicionar pacientes aos resultados
        if (pacientes) {
          for (const paciente of pacientes) {
            searchResults.push({
              id: paciente.id,
              type: "paciente",
              title: paciente.nome,
              subtitle: paciente.telefone,
              data: paciente,
            });
          }
        }

        // Adicionar agendamentos aos resultados
        if (agendamentos) {
          for (const agendamento of agendamentos) {
            // Buscar nome do paciente
            const { data: paciente } = await supabase
              .from("pacientes")
              .select("nome")
              .eq("id", agendamento.paciente_id)
              .single();

            const dataFormatada = new Date(agendamento.data_agendamento).toLocaleDateString("pt-BR");

            searchResults.push({
              id: agendamento.id,
              type: "agendamento",
              title: agendamento.procedimento,
              subtitle: `${paciente?.nome || "Paciente"} - ${dataFormatada}`,
              data: agendamento,
            });
          }
        }

        setResults(searchResults);
      } catch (error) {
        console.error("Erro ao buscar:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce
    const timeoutId = setTimeout(searchData, 300);
    return () => clearTimeout(timeoutId);
  }, [query, user?.id]);

  return { results, isLoading };
};
