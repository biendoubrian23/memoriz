-- =============================================
-- Migration 008: Super Admin role
-- Adds a 'role' column to profiles for access control.
-- Brian Biendou (clarkybrian@outlook.fr) = super_admin
-- =============================================

-- Add role column (default 'user')
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user'
  CHECK (role IN ('user', 'super_admin'));

-- Grant super_admin to Brian Biendou
UPDATE public.profiles
SET role = 'super_admin'
WHERE email = 'clarkybrian@outlook.fr';

-- ── Policy: Only super_admin can INSERT/UPDATE/DELETE layout_templates ──
CREATE POLICY "Super admin can insert templates"
  ON public.layout_templates FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can update templates"
  ON public.layout_templates FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admin can delete templates"
  ON public.layout_templates FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );
