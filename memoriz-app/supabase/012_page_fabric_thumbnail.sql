-- Add fabric_thumbnail column to project_pages
-- Stores a PNG data URL thumbnail generated from the Fabric canvas
ALTER TABLE public.project_pages
  ADD COLUMN IF NOT EXISTS fabric_thumbnail TEXT;
