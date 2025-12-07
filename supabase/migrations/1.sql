-- Create dentistas table (VERSÃO CORRIGIDA)
CREATE TABLE public.dentistas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cro TEXT NOT NULL UNIQUE,
  especialidade TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  cpf TEXT NOT NULL UNIQUE,
  endereco TEXT,
  data_nascimento DATE,
  status TEXT NOT NULL DEFAULT 'Ativo' CHECK (status IN ('Ativo', 'Inativo')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.dentistas ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (CORRIGIDAS - sem lógica circular)
CREATE POLICY "Users can view their own dentistas" 
ON public.dentistas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dentistas" 
ON public.dentistas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dentistas" 
ON public.dentistas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dentistas" 
ON public.dentistas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps (ADICIONADA)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates (AGORA FUNCIONA)
CREATE TRIGGER update_dentistas_updated_at
BEFORE UPDATE ON public.dentistas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_dentistas_user_id ON public.dentistas(user_id);
CREATE INDEX idx_dentistas_cro ON public.dentistas(cro);
CREATE INDEX idx_dentistas_status ON public.dentistas(status);

-- Índices adicionais recomendados
CREATE INDEX idx_dentistas_email ON public.dentistas(email);
CREATE INDEX idx_dentistas_cpf ON public.dentistas(cpf);
CREATE INDEX idx_dentistas_nome ON public.dentistas USING gin(to_tsvector('portuguese', nome));

-- Validações adicionais
ALTER TABLE public.dentistas ADD CONSTRAINT check_cro_format 
CHECK (cro ~ '^[0-9]{4,6}$');

ALTER TABLE public.dentistas ADD CONSTRAINT check_cpf_format 
CHECK (cpf ~ '^[0-9]{11}$');