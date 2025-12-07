-- Corrigir constraints problemáticas da tabela dentistas
-- Remove constraints muito restritivas que estão causando erro 400

-- Remover constraints problemáticas
ALTER TABLE public.dentistas DROP CONSTRAINT IF EXISTS check_cro_format;
ALTER TABLE public.dentistas DROP CONSTRAINT IF EXISTS check_cpf_format;

-- Adicionar constraints mais flexíveis
-- CRO pode ter formato "CRO-SP 12345" ou apenas números
ALTER TABLE public.dentistas ADD CONSTRAINT check_cro_not_empty 
CHECK (length(trim(cro)) > 0);

-- CPF pode ter formato "000.000.000-00" ou apenas números
ALTER TABLE public.dentistas ADD CONSTRAINT check_cpf_not_empty 
CHECK (length(trim(cpf)) > 0);

-- Adicionar constraint para email válido
ALTER TABLE public.dentistas ADD CONSTRAINT check_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Adicionar constraint para telefone não vazio
ALTER TABLE public.dentistas ADD CONSTRAINT check_telefone_not_empty 
CHECK (length(trim(telefone)) > 0);

-- Adicionar constraint para nome não vazio
ALTER TABLE public.dentistas ADD CONSTRAINT check_nome_not_empty 
CHECK (length(trim(nome)) > 0);