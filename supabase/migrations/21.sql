-- Create contas_receber table
CREATE TABLE IF NOT EXISTS public.contas_receber (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  paciente_id UUID,
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL,
  data_vencimento DATE NOT NULL,
  data_recebimento DATE,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Recebida', 'Vencida', 'Cancelada')),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contas_receber ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own contas_receber"
  ON public.contas_receber
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contas_receber"
  ON public.contas_receber
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contas_receber"
  ON public.contas_receber
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contas_receber"
  ON public.contas_receber
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_contas_receber_user_id ON public.contas_receber(user_id);
CREATE INDEX idx_contas_receber_paciente_id ON public.contas_receber(paciente_id);
CREATE INDEX idx_contas_receber_status ON public.contas_receber(status);
CREATE INDEX idx_contas_receber_data_vencimento ON public.contas_receber(data_vencimento);

-- Create trigger for updated_at
CREATE TRIGGER update_contas_receber_updated_at
  BEFORE UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to automatically update status
CREATE TRIGGER atualizar_status_contas_receber
  BEFORE INSERT OR UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_status_contas_vencidas();