-- Create radiografias table
CREATE TABLE public.radiografias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  imagem_base64 TEXT NOT NULL,
  tipo_exame TEXT,
  data_exame DATE,
  laudo TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.radiografias ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own radiografias"
ON public.radiografias
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own radiografias"
ON public.radiografias
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own radiografias"
ON public.radiografias
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own radiografias"
ON public.radiografias
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_radiografias_updated_at
BEFORE UPDATE ON public.radiografias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();