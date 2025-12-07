-- Create cheques table
CREATE TABLE IF NOT EXISTS public.cheques (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  numero_cheque TEXT NOT NULL,
  banco TEXT NOT NULL,
  agencia TEXT NOT NULL,
  conta TEXT NOT NULL,
  emitente TEXT NOT NULL,
  cpf_cnpj TEXT,
  valor NUMERIC NOT NULL,
  data_emissao DATE NOT NULL,
  data_vencimento DATE NOT NULL,
  data_compensacao DATE,
  status TEXT NOT NULL DEFAULT 'A Compensar' CHECK (status IN ('A Compensar', 'Compensado', 'Devolvido', 'Cancelado')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cheques ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own cheques"
  ON public.cheques
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cheques"
  ON public.cheques
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cheques"
  ON public.cheques
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cheques"
  ON public.cheques
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_cheques_user_id ON public.cheques(user_id);
CREATE INDEX idx_cheques_status ON public.cheques(status);
CREATE INDEX idx_cheques_data_vencimento ON public.cheques(data_vencimento);
CREATE INDEX idx_cheques_numero_cheque ON public.cheques(numero_cheque);

-- Create trigger for updated_at
CREATE TRIGGER update_cheques_updated_at
  BEFORE UPDATE ON public.cheques
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();