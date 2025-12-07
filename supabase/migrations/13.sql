-- Create fotos table
CREATE TABLE public.fotos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  imagem_base64 TEXT NOT NULL,
  tipo TEXT,
  data_foto DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.fotos ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own fotos"
ON public.fotos
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fotos"
ON public.fotos
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fotos"
ON public.fotos
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fotos"
ON public.fotos
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_fotos_updated_at
BEFORE UPDATE ON public.fotos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();