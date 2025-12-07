-- Fix RLS: remove recursive policies and enforce per-user ownership
DROP POLICY IF EXISTS "Users can view dentistas from their organization" ON public.dentistas;
DROP POLICY IF EXISTS "Users can create dentistas" ON public.dentistas;
DROP POLICY IF EXISTS "Users can update dentistas from their organization" ON public.dentistas;
DROP POLICY IF EXISTS "Users can delete dentistas from their organization" ON public.dentistas;

-- Minimal, secure RLS: each user can only access their own rows
CREATE POLICY "Dentistas are viewable by owner"
ON public.dentistas
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Dentistas insert by owner"
ON public.dentistas
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dentistas update by owner"
ON public.dentistas
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Dentistas delete by owner"
ON public.dentistas
FOR DELETE
USING (auth.uid() = user_id);