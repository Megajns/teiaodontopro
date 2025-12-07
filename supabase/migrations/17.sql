-- Create honorarios table
CREATE TABLE public.honorarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  procedimento TEXT NOT NULL,
  codigo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor_particular NUMERIC NOT NULL DEFAULT 0,
  valor_convenio NUMERIC NOT NULL DEFAULT 0,
  duracao_media INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'Ativo',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.honorarios ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own honorarios" 
ON public.honorarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own honorarios" 
ON public.honorarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own honorarios" 
ON public.honorarios 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own honorarios" 
ON public.honorarios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_honorarios_updated_at
BEFORE UPDATE ON public.honorarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();