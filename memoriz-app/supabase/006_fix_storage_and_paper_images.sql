-- ============================================================
-- Memoriz - Fix storage + paper images v006
-- Fichier: 006_fix_storage_and_paper_images.sql
-- Description:
--   1. Rendre le bucket "user-photos" public pour que getPublicUrl() fonctionne
--   2. Ajouter image_url aux paper_types
--   3. Ajouter image_url aux printing_types
-- ============================================================

-- =====================
-- 1. BUCKET PUBLIC
-- =====================
-- Le bucket est actuellement privé, ce qui empêche getPublicUrl() de servir les images.
-- En le rendant public, les URLs construites par Supabase seront accessibles.
UPDATE storage.buckets SET public = true WHERE id = 'user-photos';

-- =====================
-- 2. PAPER_TYPES : ajouter image_url
-- =====================
ALTER TABLE public.paper_types ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE public.paper_types SET image_url = '/images/papier/Standard.jpg' WHERE slug = 'standard-90';
UPDATE public.paper_types SET image_url = '/images/papier/doux.jpg' WHERE slug = 'doux-80';
UPDATE public.paper_types SET image_url = '/images/papier/cr%C3%A8me_ancien.jpg' WHERE slug = 'creme-ancien-80';
UPDATE public.paper_types SET image_url = '/images/papier/lisse%20satin.jpg' WHERE slug = 'lisse-satin-115';
UPDATE public.paper_types SET image_url = '/images/papier/premium%20photo.jpg' WHERE slug = 'premium-photo-170';

-- =====================
-- 3. PRINTING_TYPES : ajouter image_url (optionnel, le UI utilise des gradients CSS)
-- =====================
ALTER TABLE public.printing_types ADD COLUMN IF NOT EXISTS image_url TEXT;
