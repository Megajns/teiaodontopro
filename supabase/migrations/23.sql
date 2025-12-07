-- Create fluxo_caixa table
CREATE TABLE IF NOT EXISTS public.fluxo_caixa (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Entrada', 'Saída')),
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_movimentacao DATE NOT NULL,
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fluxo_caixa ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own fluxo_caixa"
  ON public.fluxo_caixa
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own fluxo_caixa"
  ON public.fluxo_caixa
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fluxo_caixa"
  ON public.fluxo_caixa
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fluxo_caixa"
  ON public.fluxo_caixa
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_fluxo_caixa_user_id ON public.fluxo_caixa(user_id);
CREATE INDEX idx_fluxo_caixa_tipo ON public.fluxo_caixa(tipo);
CREATE INDEX idx_fluxo_caixa_data_movimentacao ON public.fluxo_caixa(data_movimentacao);

-- Create trigger for updated_at
CREATE TRIGGER update_fluxo_caixa_updated_at
  BEFORE UPDATE ON public.fluxo_caixa
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();