-- =============================================
-- Migration 010: Créer le bucket "images" pour les thumbnails de templates
-- Utilisé par le template editor pour stocker les aperçus PNG
-- =============================================

-- 1. Créer le bucket (public pour que les URLs soient accessibles)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'images',
  'images',
  true,
  10485760, -- 10 Mo
  ARRAY['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Policy : tout le monde peut lire (bucket public)
CREATE POLICY "Public read images" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'images');

-- 3. Policy : les utilisateurs authentifiés peuvent uploader
CREATE POLICY "Auth users can upload images" ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );

-- 4. Policy : les utilisateurs authentifiés peuvent mettre à jour (upsert)
CREATE POLICY "Auth users can update images" ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );

-- 5. Policy : les utilisateurs authentifiés peuvent supprimer
CREATE POLICY "Auth users can delete images" ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'images' AND
    auth.role() = 'authenticated'
  );
