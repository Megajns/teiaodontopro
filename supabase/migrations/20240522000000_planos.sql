-- Migration to add Plans (Planos) for clinics

-- 1. Create function to check if user is master admin (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND is_master = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Create planos table
CREATE TABLE IF NOT EXISTS public.planos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    descricao TEXT,
    valor_mensal NUMERIC(10,2) NOT NULL DEFAULT 0,
    limite_pacientes INTEGER, -- NULL for unlimited
    limite_usuarios INTEGER,   -- NULL for unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Add plano_id to informacoes_clinica
ALTER TABLE public.informacoes_clinica 
ADD COLUMN IF NOT EXISTS plano_id UUID REFERENCES public.planos(id);

-- 4. Enable RLS for planos
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- Everyone authenticated can view plans (to see what they are using)
DROP POLICY IF EXISTS "Anyone authenticated can view plans" ON public.planos;
CREATE POLICY "Anyone authenticated can view plans"
ON public.planos FOR SELECT
TO authenticated
USING (true);

-- Only master admins can manage plans
DROP POLICY IF EXISTS "Master admins can manage plans" ON public.planos;
CREATE POLICY "Master admins can manage plans"
ON public.planos FOR ALL
USING (public.is_master_admin());

-- 5. Insert some initial plans
INSERT INTO public.planos (nome, descricao, valor_mensal, limite_pacientes, limite_usuarios)
VALUES 
('Básico', 'Plano ideal para pequenas clínicas', 199.90, 100, 2),
('Profissional', 'Plano completo para clínicas em crescimento', 399.90, 500, 5),
('Unlimited', 'Tudo ilimitado para grandes operações', 799.90, NULL, NULL)
ON CONFLICT DO NOTHING;

-- 6. Assign the first plan to existing clinics if they don't have one
UPDATE public.informacoes_clinica
SET plano_id = (SELECT id FROM public.planos WHERE nome = 'Básico' LIMIT 1)
WHERE plano_id IS NULL;
