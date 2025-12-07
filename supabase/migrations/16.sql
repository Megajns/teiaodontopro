-- Create sequence for ordem_servico number
CREATE SEQUENCE IF NOT EXISTS ordem_servico_numero_seq START 1;

-- Create ordem_servico table
CREATE TABLE public.ordem_servico (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  numero_os TEXT NOT NULL UNIQUE DEFAULT 'OS-' || to_char(nextval('ordem_servico_numero_seq'), 'FM000000'),
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE RESTRICT,
  dentista_id UUID NOT NULL REFERENCES public.dentistas(id) ON DELETE RESTRICT,
  data_abertura DATE NOT NULL DEFAULT CURRENT_DATE,
  data_prevista DATE,
  data_conclusao DATE,
  procedimentos JSONB NOT NULL DEFAULT '[]'::jsonb,
  valor_total NUMERIC(10, 2) DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Aberta',
  prioridade TEXT DEFAULT 'Normal',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ordem_servico ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own ordem_servico"
ON public.ordem_servico
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ordem_servico"
ON public.ordem_servico
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ordem_servico"
ON public.ordem_servico
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ordem_servico"
ON public.ordem_servico
FOR DELETE
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_ordem_servico_updated_at
BEFORE UPDATE ON public.ordem_servico
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_ordem_servico_paciente ON public.ordem_servico(paciente_id);
CREATE INDEX idx_ordem_servico_dentista ON public.ordem_servico(dentista_id);
CREATE INDEX idx_ordem_servico_status ON public.ordem_servico(status);