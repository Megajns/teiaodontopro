-- Criar tabela de contas a pagar
CREATE TABLE public.contas_pagar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedores(id),
  descricao TEXT NOT NULL,
  categoria TEXT NOT NULL,
  valor NUMERIC NOT NULL CHECK (valor > 0),
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Paga', 'Vencida', 'Cancelada')),
  forma_pagamento TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para melhor performance
CREATE INDEX idx_contas_pagar_user_id ON public.contas_pagar(user_id);
CREATE INDEX idx_contas_pagar_status ON public.contas_pagar(status);
CREATE INDEX idx_contas_pagar_data_vencimento ON public.contas_pagar(data_vencimento);
CREATE INDEX idx_contas_pagar_fornecedor_id ON public.contas_pagar(fornecedor_id);

-- Enable Row Level Security
ALTER TABLE public.contas_pagar ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own contas_pagar" 
ON public.contas_pagar 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contas_pagar" 
ON public.contas_pagar 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contas_pagar" 
ON public.contas_pagar 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contas_pagar" 
ON public.contas_pagar 
FOR DELETE 
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_contas_pagar_updated_at
BEFORE UPDATE ON public.contas_pagar
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar status automaticamente quando vencida
CREATE OR REPLACE FUNCTION public.atualizar_status_contas_vencidas()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'Pendente' AND NEW.data_vencimento < CURRENT_DATE AND NEW.data_pagamento IS NULL THEN
    NEW.status = 'Vencida';
  END IF;
  
  IF NEW.data_pagamento IS NOT NULL AND NEW.status IN ('Pendente', 'Vencida') THEN
    NEW.status = 'Paga';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_atualizar_status_contas_vencidas
BEFORE INSERT OR UPDATE ON public.contas_pagar
FOR EACH ROW
EXECUTE FUNCTION public.atualizar_status_contas_vencidas();