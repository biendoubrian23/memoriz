-- ============================================================
-- Migration 011 — Per-page Fabric canvas + template publish flag
-- ============================================================

-- 1. Add fabric_json column to project_pages
--    Stores the per-page Fabric.js canvas JSON when a user
--    customises a template on their own page. NULL = use template as-is.
ALTER TABLE public.project_pages
  ADD COLUMN IF NOT EXISTS fabric_json TEXT;

-- 2. Add is_published flag to layout_templates
--    Super admin can save drafts (is_published=false) and publish when ready.
--    Regular users only see published templates.
ALTER TABLE public.layout_templates
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Set all existing templates as published (backward compat)
UPDATE public.layout_templates SET is_published = true WHERE is_published IS NULL OR is_published = false;
