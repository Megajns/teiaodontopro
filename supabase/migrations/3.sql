-- Create pacientes table
CREATE TABLE public.pacientes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    nome TEXT NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data_nascimento DATE,
    ultima_consulta DATE,
    status TEXT NOT NULL DEFAULT 'Ativo',
    endereco TEXT,
    cpf TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Pacientes are viewable by owner" 
ON public.pacientes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Pacientes insert by owner" 
ON public.pacientes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pacientes update by owner" 
ON public.pacientes 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pacientes delete by owner" 
ON public.pacientes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_pacientes_updated_at
BEFORE UPDATE ON public.pacientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();