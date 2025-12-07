-- Create convenios table
CREATE TABLE public.convenios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  codigo TEXT,
  tipo TEXT NOT NULL,
  percentual_cobertura NUMERIC(5,2),
  valor_consulta NUMERIC(10,2),
  carencia_dias INTEGER DEFAULT 0,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.convenios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for convenios
CREATE POLICY "Convenios are viewable by owner" 
ON public.convenios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Convenios insert by owner" 
ON public.convenios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Convenios update by owner" 
ON public.convenios 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Convenios delete by owner" 
ON public.convenios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_convenios_updated_at
BEFORE UPDATE ON public.convenios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();