-- Create laboratorio table
CREATE TABLE public.laboratorio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paciente TEXT NOT NULL,
  procedimento TEXT NOT NULL,
  laboratorio TEXT NOT NULL,
  data_envio DATE NOT NULL,
  data_retorno DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Enviado',
  valor NUMERIC NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.laboratorio ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own laboratorio" 
ON public.laboratorio 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own laboratorio" 
ON public.laboratorio 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own laboratorio" 
ON public.laboratorio 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own laboratorio" 
ON public.laboratorio 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_laboratorio_updated_at
BEFORE UPDATE ON public.laboratorio
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();