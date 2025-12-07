-- Criar tabela de configurações do sistema
CREATE TABLE public.configuracoes_sistema (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  permitir_registro BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own configuracoes_sistema"
ON public.configuracoes_sistema
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own configuracoes_sistema"
ON public.configuracoes_sistema
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own configuracoes_sistema"
ON public.configuracoes_sistema
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_configuracoes_sistema_updated_at
BEFORE UPDATE ON public.configuracoes_sistema
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração padrão para usuários existentes
INSERT INTO public.configuracoes_sistema (user_id, permitir_registro)
SELECT id, true FROM auth.users
ON CONFLICT (user_id) DO NOTHING;