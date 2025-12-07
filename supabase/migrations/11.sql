-- Create odontograma table
CREATE TABLE public.odontograma (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  dados_dentes JSONB DEFAULT '{}'::jsonb,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(paciente_id)
);

-- Enable Row Level Security
ALTER TABLE public.odontograma ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own odontograma"
ON public.odontograma
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own odontograma"
ON public.odontograma
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own odontograma"
ON public.odontograma
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own odontograma"
ON public.odontograma
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_odontograma_updated_at
BEFORE UPDATE ON public.odontograma
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();