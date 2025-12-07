-- Criar tabela de manuais e códigos
CREATE TABLE public.manuais_codigos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Manual', 'Código de Procedimento', 'Tabela', 'Documento')),
  titulo TEXT NOT NULL,
  codigo TEXT,
  descricao TEXT,
  categoria TEXT NOT NULL,
  conteudo TEXT,
  link_externo TEXT,
  arquivo_base64 TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.manuais_codigos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own manuais_codigos"
ON public.manuais_codigos
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own manuais_codigos"
ON public.manuais_codigos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own manuais_codigos"
ON public.manuais_codigos
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own manuais_codigos"
ON public.manuais_codigos
FOR DELETE
USING (auth.uid() = user_id);

-- Trigger para updated_at
CREATE TRIGGER update_manuais_codigos_updated_at
BEFORE UPDATE ON public.manuais_codigos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para melhorar performance
CREATE INDEX idx_manuais_codigos_user_id ON public.manuais_codigos(user_id);
CREATE INDEX idx_manuais_codigos_tipo ON public.manuais_codigos(tipo);
CREATE INDEX idx_manuais_codigos_categoria ON public.manuais_codigos(categoria);
CREATE INDEX idx_manuais_codigos_tags ON public.manuais_codigos USING GIN(tags);