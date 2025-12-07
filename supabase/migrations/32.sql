-- Criar política para permitir leitura pública do campo permitir_registro
-- Isso é necessário para a tela de login verificar se o registro está habilitado
CREATE POLICY "Anyone can view permitir_registro setting"
ON public.configuracoes_sistema
FOR SELECT
TO anon
USING (true);

-- Comentário: Esta política permite que usuários não autenticados (anon) 
-- consultem a configuração de registro na tela de login