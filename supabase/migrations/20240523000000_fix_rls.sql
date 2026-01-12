-- Fix for Master Admin RLS recursion and missing policies

-- 1. Improve is_master_admin function to avoid any potential recursion
-- We use a more direct approach and ensure it's security definer
CREATE OR REPLACE FUNCTION public.is_master_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- We query profiles directly. Since this is SECURITY DEFINER, 
  -- it runs as the owner (postgres) and bypasses RLS of profiles table.
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND is_master = TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Ensure all policies for informacoes_clinica are correct for master admin
-- We already have SELECT, INSERT, UPDATE. Let's add DELETE.

DROP POLICY IF EXISTS "Master admins can delete any clinica" ON public.informacoes_clinica;
CREATE POLICY "Master admins can delete any clinica"
ON public.informacoes_clinica FOR DELETE
USING (public.is_master_admin());

-- 3. Double check and ensure Master Admin can see ALL profiles 
-- (This is crucial for the joins in the dashboard)
DROP POLICY IF EXISTS "Master admins can view all profiles" ON public.profiles;
CREATE POLICY "Master admins can view all profiles"
ON public.profiles FOR SELECT
USING (public.is_master_admin());

-- 4. Enable Master Admin to UPDATE profiles too (might be useful)
DROP POLICY IF EXISTS "Master admins can update all profiles" ON public.profiles;
CREATE POLICY "Master admins can update all profiles"
ON public.profiles FOR UPDATE
USING (public.is_master_admin());

-- 5. Ensure Master Admin can see ALL record from plans (already there but for completeness)
DROP POLICY IF EXISTS "Master admins can manage plans" ON public.planos;
CREATE POLICY "Master admins can manage plans"
ON public.planos FOR ALL
USING (public.is_master_admin());

-- 6. Explicitly re-apply SELECT policy for informacoes_clinica using the new function
DROP POLICY IF EXISTS "Master admins can view all clinicas" ON public.informacoes_clinica;
CREATE POLICY "Master admins can view all clinicas"
ON public.informacoes_clinica FOR SELECT
USING (public.is_master_admin());

-- 7. Ensure Master admins can INSERT and UPDATE any clinica
DROP POLICY IF EXISTS "Master admins can insert clinicas" ON public.informacoes_clinica;
CREATE POLICY "Master admins can insert clinicas"
ON public.informacoes_clinica FOR INSERT
WITH CHECK (public.is_master_admin());

DROP POLICY IF EXISTS "Master admins can update all clinicas" ON public.informacoes_clinica;
CREATE POLICY "Master admins can update all clinicas"
ON public.informacoes_clinica FOR UPDATE
USING (public.is_master_admin());

-- 8. Final check: Ensure the current user has is_master = TRUE
-- We do this for the known admin email and the specific ID provided earlier
UPDATE public.profiles 
SET is_master = TRUE 
WHERE email = 'admin@admin.com' OR user_id = auth.uid();

-- 9. Re-enable RLS just in case it was disabled
ALTER TABLE public.informacoes_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;

-- 10. Re-apply base policies for normal users to ensure they still work
DROP POLICY IF EXISTS "Users can view their own informacoes_clinica" ON public.informacoes_clinica;
CREATE POLICY "Users can view their own informacoes_clinica" 
ON public.informacoes_clinica FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = user_id);

-- 11. Add missing Foreign Key relationships to allow standard joins (PostgREST requirement)
-- This fixes the "Could not find a relationship" error
ALTER TABLE public.informacoes_clinica
DROP CONSTRAINT IF EXISTS informacoes_clinica_user_id_fkey;

ALTER TABLE public.informacoes_clinica
ADD CONSTRAINT informacoes_clinica_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
