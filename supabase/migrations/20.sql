-- Corrigir search_path da função para segurança
CREATE OR REPLACE FUNCTION public.atualizar_status_contas_vencidas()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'Pendente' AND NEW.data_vencimento < CURRENT_DATE AND NEW.data_pagamento IS NULL THEN
    NEW.status = 'Vencida';
  END IF;
  
  IF NEW.data_pagamento IS NOT NULL AND NEW.status IN ('Pendente', 'Vencida') THEN
    NEW.status = 'Paga';
  END IF;
  
  RETURN NEW;
END;
$$;