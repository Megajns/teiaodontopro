-- Create funcionarios table
CREATE TABLE public.funcionarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  cargo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT NOT NULL,
  data_admissao DATE,
  status TEXT NOT NULL DEFAULT 'Ativo',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.funcionarios ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for funcionarios
CREATE POLICY "Funcionarios are viewable by owner" 
ON public.funcionarios 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Funcionarios insert by owner" 
ON public.funcionarios 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Funcionarios update by owner" 
ON public.funcionarios 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Funcionarios delete by owner" 
ON public.funcionarios 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_funcionarios_updated_at
BEFORE UPDATE ON public.funcionarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();