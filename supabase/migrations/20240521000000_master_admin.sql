-- Migration to add Master Admin capabilities and global settings

-- 0. Create function to check if user is master admin (security definer to avoid RLS recursion)
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

-- 1. Add is_master to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_master BOOLEAN DEFAULT FALSE;

-- 2. Add status to informacoes_clinica
ALTER TABLE public.informacoes_clinica ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 3. Create global settings table
CREATE TABLE IF NOT EXISTS public.configuracoes_globais (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    permitir_cadastro_publico BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for global settings
ALTER TABLE public.configuracoes_globais ENABLE ROW LEVEL SECURITY;

-- Everyone can read global settings
DROP POLICY IF EXISTS "Anyone can view global settings" ON public.configuracoes_globais;
CREATE POLICY "Anyone can view global settings"
ON public.configuracoes_globais FOR SELECT
USING (true);

-- Only master admins can update it
DROP POLICY IF EXISTS "Only master admins can update global settings" ON public.configuracoes_globais;
CREATE POLICY "Only master admins can update global settings"
ON public.configuracoes_globais FOR UPDATE
USING (public.is_master_admin());

-- 4. Set the specific user as Master Admin
UPDATE public.profiles 
SET is_master = TRUE 
WHERE user_id = 'b4a721ab-c69d-41bb-91ba-542f9124e276';

-- Also ensure the admin@admin.com stays as master if it exists
UPDATE public.profiles 
SET is_master = TRUE 
WHERE email = 'admin@admin.com';

-- 5. Insert initial global setting
INSERT INTO public.configuracoes_globais (permitir_cadastro_publico)
SELECT TRUE
WHERE NOT EXISTS (SELECT 1 FROM public.configuracoes_globais);

-- 6. Add policy for master admins to view ALL profiles
DROP POLICY IF EXISTS "Master admins can view all profiles" ON public.profiles;
CREATE POLICY "Master admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_master_admin());

-- 7. Add policy for master admins to view ALL clinicas
DROP POLICY IF EXISTS "Master admins can view all clinicas" ON public.informacoes_clinica;
CREATE POLICY "Master admins can view all clinicas"
ON public.informacoes_clinica FOR SELECT
USING (public.is_master_admin());

-- 8. Add policy for master admins to update ALL clinicas
DROP POLICY IF EXISTS "Master admins can update all clinicas" ON public.informacoes_clinica;
CREATE POLICY "Master admins can update all clinicas"
ON public.informacoes_clinica FOR UPDATE
USING (public.is_master_admin());

-- 9. Add policy for master admins to insert clinicas
DROP POLICY IF EXISTS "Master admins can insert clinicas" ON public.informacoes_clinica;
CREATE POLICY "Master admins can insert clinicas"
ON public.informacoes_clinica FOR INSERT
WITH CHECK (public.is_master_admin());
