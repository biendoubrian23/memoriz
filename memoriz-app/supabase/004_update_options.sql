-- ============================================================
-- Memoriz - Mise à jour des options v004
-- Fichier: 004_update_options.sql
-- Description: Mise à jour reliures, papiers, formats, pelliculages
--   - Remplacement "Spirale" par "Rembordé"
--   - Nouveaux prix reliures
--   - 5 types de papier (au lieu de 3)
--   - Images mises à jour pour toutes les options
-- ============================================================

-- =====================
-- RELIURES : mise à jour
-- =====================

-- Supprimer l'ancienne option "Spirale"
DELETE FROM public.binding_types WHERE slug = 'spirale';

-- Mettre à jour "Dos carré collé"
UPDATE public.binding_types SET
  description = 'Reliure professionnelle avec dos plat collé. Idéale pour les albums et livres photo haut de gamme.',
  price_modifier = 2.00,
  image_url = '/images/reliures/dos-carre-colle.jpeg'
WHERE slug = 'dos-carre-colle';

-- Insérer "Rembordé"
INSERT INTO public.binding_types (name, slug, description, price_modifier, image_url, display_order) VALUES
  ('Rembordé', 'remborde', 'Reliure rembordée avec couverture rigide. Parfaite pour les beaux livres et albums premium.', 3.50, '/images/reliures/remborde.jpeg', 2)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_modifier = EXCLUDED.price_modifier,
  image_url = EXCLUDED.image_url,
  display_order = EXCLUDED.display_order;

-- Mettre à jour "Agrafé"
UPDATE public.binding_types SET
  description = 'Reliure agrafée au centre. Idéale pour les magazines et brochures jusqu''à 48 pages.',
  price_modifier = 1.00,
  image_url = '/images/reliures/agrafe.jpeg'
WHERE slug = 'agrafe';

-- =====================
-- FORMATS : mise à jour images
-- =====================
UPDATE public.formats SET
  image_url = '/images/format/A4%20portrait.jpeg'
WHERE slug = 'a4-portrait';

UPDATE public.formats SET
  image_url = '/images/format/paysage.jpeg'
WHERE slug = 'a4-paysage';

UPDATE public.formats SET
  image_url = '/images/format/carr%C3%A9.jpeg'
WHERE slug = 'carre-21';

-- =====================
-- PAPIERS : remplacer les 3 anciens par 5 nouveaux
-- =====================

-- Supprimer les anciens papiers
DELETE FROM public.paper_types WHERE slug IN ('mat-170', 'brillant-200', 'satine-200');

-- Insérer les 5 nouveaux types de papier
INSERT INTO public.paper_types (name, slug, description, price_modifier, display_order) VALUES
  ('Standard', 'standard-90', 'Papier standard blanc 90g, bon rapport qualité/prix pour les projets du quotidien.', 0.00, 1),
  ('Doux', 'doux-80', 'Papier doux au toucher 80g avec un rendu agréable et une bonne tenue des couleurs.', 0.50, 2),
  ('Crème / Ancien', 'creme-ancien-80', 'Papier teinté beige 80g pour un rendu vintage et chaleureux. Idéal pour les albums nostalgiques.', 0.50, 3),
  ('Lisse satin', 'lisse-satin-115', 'Papier satiné lisse 115g avec un léger reflet soyeux. Couleurs fidèles et rendu élégant.', 1.50, 4),
  ('Premium Photo', 'premium-photo-170', 'Papier photo premium épais 170g. Rendu photographique professionnel, couleurs éclatantes.', 3.00, 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price_modifier = EXCLUDED.price_modifier,
  display_order = EXCLUDED.display_order;

-- =====================
-- PELLICULAGES : ajouter colonne image_url + mise à jour
-- =====================
ALTER TABLE public.lamination_types ADD COLUMN IF NOT EXISTS image_url TEXT;

UPDATE public.lamination_types SET
  description = 'Finition brillante sur la couverture. Couleurs vives et éclatantes, effet wow garanti.',
  image_url = '/images/pelliculage/brillant.png',
  display_order = 1
WHERE slug = 'brillant';

UPDATE public.lamination_types SET
  description = 'Finition mate sur la couverture. Toucher doux et velouté, aspect premium et moderne.',
  image_url = '/images/pelliculage/mat.png',
  display_order = 2
WHERE slug = 'mat';

UPDATE public.lamination_types SET
  description = 'Finition veloutée ultra-douce au toucher. Sensation de luxe, résistant aux traces de doigts.',
  price_modifier = 4.00,
  image_url = '/images/pelliculage/soft-touch.png',
  display_order = 3
WHERE slug = 'soft-touch';

-- =====================
-- IMPRESSION : pas de changement de prix
-- =====================
UPDATE public.printing_types SET
  description = 'L''intérieur de mon livre a des pages en couleurs. Rendu photographique haute définition.'
WHERE slug = 'couleur';

UPDATE public.printing_types SET
  description = 'L''intérieur de mon livre sera imprimé en N&B. Rendu artistique et intemporel.'
WHERE slug = 'noir-blanc';
