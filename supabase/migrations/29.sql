-- Remove horario_funcionamento column from informacoes_clinica table
ALTER TABLE public.informacoes_clinica DROP COLUMN IF EXISTS horario_funcionamento;