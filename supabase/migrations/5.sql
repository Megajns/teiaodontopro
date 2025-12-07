-- Create fornecedores table
CREATE TABLE public.fornecedores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  cnpj TEXT,
  contato TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  endereco TEXT,
  categoria TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fornecedores ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for fornecedores
CREATE POLICY "Fornecedores are viewable by owner" 
ON public.fornecedores 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Fornecedores insert by owner" 
ON public.fornecedores 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Fornecedores update by owner" 
ON public.fornecedores 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Fornecedores delete by owner" 
ON public.fornecedores 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fornecedores_updated_at
BEFORE UPDATE ON public.fornecedores
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();