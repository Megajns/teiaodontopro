-- Create ortodontia table
CREATE TABLE public.ortodontia (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_inicio DATE,
  previsao_termino DATE,
  tipo_aparelho TEXT,
  diagnostico TEXT,
  plano_tratamento TEXT,
  progresso TEXT,
  proxima_consulta DATE,
  observacoes TEXT,
  status TEXT DEFAULT 'Em Andamento',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(paciente_id)
);

-- Enable Row Level Security
ALTER TABLE public.ortodontia ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own ortodontia"
ON public.ortodontia
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ortodontia"
ON public.ortodontia
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ortodontia"
ON public.ortodontia
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ortodontia"
ON public.ortodontia
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ortodontia_updated_at
BEFORE UPDATE ON public.ortodontia
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();