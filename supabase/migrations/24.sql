-- Create comissoes table
CREATE TABLE IF NOT EXISTS public.comissoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  dentista_id UUID NOT NULL,
  referencia TEXT NOT NULL,
  valor_total_procedimentos NUMERIC NOT NULL DEFAULT 0,
  percentual_comissao NUMERIC NOT NULL,
  valor_comissao NUMERIC NOT NULL,
  data_inicio DATE NOT NULL,
  data_fim DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Paga', 'Cancelada')),
  data_pagamento DATE,
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comissoes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own comissoes"
  ON public.comissoes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own comissoes"
  ON public.comissoes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comissoes"
  ON public.comissoes
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comissoes"
  ON public.comissoes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_comissoes_user_id ON public.comissoes(user_id);
CREATE INDEX idx_comissoes_dentista_id ON public.comissoes(dentista_id);
CREATE INDEX idx_comissoes_status ON public.comissoes(status);
CREATE INDEX idx_comissoes_data_inicio ON public.comissoes(data_inicio);
CREATE INDEX idx_comissoes_data_fim ON public.comissoes(data_fim);

-- Create trigger for updated_at
CREATE TRIGGER update_comissoes_updated_at
  BEFORE UPDATE ON public.comissoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();