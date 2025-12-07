-- Create patrimonio table
CREATE TABLE public.patrimonio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item TEXT NOT NULL,
  codigo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_aquisicao DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patrimonio ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own patrimonio" 
ON public.patrimonio 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own patrimonio" 
ON public.patrimonio 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own patrimonio" 
ON public.patrimonio 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own patrimonio" 
ON public.patrimonio 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patrimonio_updated_at
BEFORE UPDATE ON public.patrimonio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();