-- Create contatos_uteis table
CREATE TABLE public.contatos_uteis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  categoria TEXT NOT NULL,
  tipo TEXT,
  email TEXT,
  endereco TEXT,
  horario_funcionamento TEXT,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.contatos_uteis ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own contatos_uteis" 
ON public.contatos_uteis 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contatos_uteis" 
ON public.contatos_uteis 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contatos_uteis" 
ON public.contatos_uteis 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contatos_uteis" 
ON public.contatos_uteis 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contatos_uteis_updated_at
BEFORE UPDATE ON public.contatos_uteis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();