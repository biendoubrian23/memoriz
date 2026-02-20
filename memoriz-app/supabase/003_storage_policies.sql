-- ============================================================
-- Memoriz - Storage policies v003
-- Fichier: 003_storage_policies.sql
-- Description: Création du bucket et des policies pour le stockage des photos
-- ============================================================

-- Créer le bucket pour les photos utilisateur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'user-photos',
  'user-photos',
  false,
  10485760, -- 10MB max par fichier
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: les utilisateurs authentifiés peuvent uploader dans leur propre dossier
CREATE POLICY "Users can upload their own photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'user-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: les utilisateurs peuvent voir leurs propres photos
CREATE POLICY "Users can view their own photos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy: les utilisateurs peuvent supprimer leurs propres photos
CREATE POLICY "Users can delete their own photos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'user-photos' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
