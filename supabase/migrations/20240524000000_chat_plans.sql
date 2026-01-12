-- Migration to add Chat/Atendimento features to plans

-- 1. Add ativar_atendimento column to planos
ALTER TABLE public.planos 
ADD COLUMN IF NOT EXISTS ativar_atendimento BOOLEAN DEFAULT FALSE;

-- 2. Update existing plans (Enable for Unlimited and Professional)
UPDATE public.planos 
SET ativar_atendimento = TRUE 
WHERE nome IN ('Profissional', 'Unlimited');

-- 3. Update informacoes_clinica view or logic if needed, 
-- but we'll fetch this from the joined planos table in AuthContext.
