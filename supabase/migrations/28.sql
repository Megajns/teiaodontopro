-- Create informacoes_clinica table
CREATE TABLE public.informacoes_clinica (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  nome_clinica TEXT NOT NULL,
  cnpj TEXT,
  cro_clinica TEXT,
  telefone TEXT NOT NULL,
  celular TEXT,
  email TEXT NOT NULL,
  website TEXT,
  endereco TEXT NOT NULL,
  numero TEXT,
  complemento TEXT,
  bairro TEXT,
  cidade TEXT NOT NULL,
  estado TEXT NOT NULL,
  cep TEXT NOT NULL,
  horario_funcionamento JSONB DEFAULT '{"segunda": "", "terca": "", "quarta": "", "quinta": "", "sexta": "", "sabado": "", "domingo": ""}'::jsonb,
  logo_base64 TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.informacoes_clinica ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own informacoes_clinica" 
ON public.informacoes_clinica 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own informacoes_clinica" 
ON public.informacoes_clinica 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own informacoes_clinica" 
ON public.informacoes_clinica 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own informacoes_clinica" 
ON public.informacoes_clinica 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_informacoes_clinica_updated_at
BEFORE UPDATE ON public.informacoes_clinica
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();