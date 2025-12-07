-- Create ficha_clinica table
CREATE TABLE public.ficha_clinica (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  
  -- Contato de Emergência
  contato_emergencia_nome TEXT,
  contato_emergencia_telefone TEXT,
  contato_emergencia_parentesco TEXT,
  
  -- Anamnese
  queixa_principal TEXT,
  historico_medico TEXT,
  alergias TEXT,
  
  -- Exame Clínico
  pressao_arterial TEXT,
  temperatura TEXT,
  peso TEXT,
  exame_extraoral TEXT,
  exame_intraoral TEXT,
  
  -- Diagnóstico e Tratamento
  diagnostico TEXT,
  plano_tratamento TEXT,
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Um paciente tem apenas uma ficha clínica
  UNIQUE(paciente_id)
);

-- Enable Row Level Security
ALTER TABLE public.ficha_clinica ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own ficha_clinica" 
ON public.ficha_clinica 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ficha_clinica" 
ON public.ficha_clinica 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ficha_clinica" 
ON public.ficha_clinica 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ficha_clinica" 
ON public.ficha_clinica 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ficha_clinica_updated_at
BEFORE UPDATE ON public.ficha_clinica
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();