-- ============================================================
-- Memoriz - Migration v005
-- Fichier: 005_rename_layout_column.sql
-- Description: Créer les pages initiales pour les projets existants
--   qui n'ont aucune page (bug corrigé)
-- ============================================================

-- Note: la colonne s'appelle déjà layout_id dans la DB.
-- Le RENAME n'est nécessaire que si la colonne s'appelle encore layout_template.
-- ALTER TABLE public.project_pages RENAME COLUMN layout_template TO layout_id;

-- Recréer les pages initiales pour les projets existants qui n'ont aucune page
-- (Les projets créés avant cette migration ont échoué à insérer les pages
--  car le code utilisait "layout_id" mais la colonne s'appelait "layout_template")
INSERT INTO public.project_pages (project_id, page_number, page_type, layout_id, background_color)
SELECT p.id, 0, 'cover', 'cover-full', '#FFFFFF'
FROM public.projects p
WHERE NOT EXISTS (
  SELECT 1 FROM public.project_pages pp WHERE pp.project_id = p.id
);

INSERT INTO public.project_pages (project_id, page_number, page_type, layout_id, background_color)
SELECT p.id, g.n, 'content',
  CASE g.n
    WHEN 1 THEN '1-full'
    WHEN 2 THEN '2-horizontal'
    WHEN 3 THEN '4-grid'
    WHEN 4 THEN '1-full'
  END,
  '#FFFFFF'
FROM public.projects p
CROSS JOIN (VALUES (1),(2),(3),(4)) AS g(n)
WHERE EXISTS (
  SELECT 1 FROM public.project_pages pp
  WHERE pp.project_id = p.id AND pp.page_type = 'cover'
)
AND NOT EXISTS (
  SELECT 1 FROM public.project_pages pp
  WHERE pp.project_id = p.id AND pp.page_type = 'content'
);

INSERT INTO public.project_pages (project_id, page_number, page_type, layout_id, background_color)
SELECT p.id, 5, 'back_cover', 'cover-centered', '#FFFFFF'
FROM public.projects p
WHERE EXISTS (
  SELECT 1 FROM public.project_pages pp
  WHERE pp.project_id = p.id AND pp.page_type = 'cover'
)
AND NOT EXISTS (
  SELECT 1 FROM public.project_pages pp
  WHERE pp.project_id = p.id AND pp.page_type = 'back_cover'
);
