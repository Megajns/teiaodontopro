-- Create estoque table
CREATE TABLE public.estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item TEXT NOT NULL,
  codigo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  estoque INTEGER NOT NULL DEFAULT 0,
  minimo INTEGER NOT NULL DEFAULT 0,
  maximo INTEGER NOT NULL DEFAULT 0,
  valor_unitario NUMERIC NOT NULL DEFAULT 0,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own estoque" 
ON public.estoque 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estoque" 
ON public.estoque 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estoque" 
ON public.estoque 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estoque" 
ON public.estoque 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_estoque_updated_at
BEFORE UPDATE ON public.estoque
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();