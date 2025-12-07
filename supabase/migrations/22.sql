-- Drop the incorrect trigger
DROP TRIGGER IF EXISTS atualizar_status_contas_receber ON public.contas_receber;

-- Create a new function specific for contas_receber
CREATE OR REPLACE FUNCTION public.atualizar_status_contas_receber_func()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.status = 'Pendente' AND NEW.data_vencimento < CURRENT_DATE AND NEW.data_recebimento IS NULL THEN
    NEW.status = 'Vencida';
  END IF;
  
  IF NEW.data_recebimento IS NOT NULL AND NEW.status IN ('Pendente', 'Vencida') THEN
    NEW.status = 'Recebida';
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create the correct trigger
CREATE TRIGGER atualizar_status_contas_receber
  BEFORE INSERT OR UPDATE ON public.contas_receber
  FOR EACH ROW
  EXECUTE FUNCTION public.atualizar_status_contas_receber_func();