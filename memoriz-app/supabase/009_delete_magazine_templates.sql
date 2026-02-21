-- =============================================
-- Migration 009: Supprime les 7 templates magazine pré-créés
-- L'admin (super_admin) recréera ses propres templates
-- via l'éditeur Canva-like
-- =============================================

DELETE FROM public.layout_templates
WHERE id IN (
  'mag-cover-fashion',
  'mag-cover-editorial',
  'mag-article-hero',
  'mag-2photo-text',
  'mag-photo-text-split',
  'mag-full-text',
  'mag-mood-board'
);
