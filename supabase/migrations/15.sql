-- Create receituario table
CREATE TABLE public.receituario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_prescricao DATE NOT NULL,
  medicamentos JSONB NOT NULL DEFAULT '[]'::jsonb,
  diagnostico TEXT,
  observacoes TEXT,
  validade DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.receituario ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own receituario"
ON public.receituario
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receituario"
ON public.receituario
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receituario"
ON public.receituario
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receituario"
ON public.receituario
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_receituario_updated_at
BEFORE UPDATE ON public.receituario
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();