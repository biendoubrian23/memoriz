-- ============================================================
-- Memoriz - Données initiales v002
-- Fichier: 002_seed_data.sql
-- Description: Insertion des options produit (reliures, formats, papiers, pelliculages, impressions, layouts)
-- ============================================================

-- =====================
-- RELIURES
-- =====================
INSERT INTO public.binding_types (name, slug, description, price_modifier, image_url, display_order) VALUES
  ('Dos carré collé', 'dos-carre-colle', 'Reliure professionnelle avec dos plat collé. Idéale pour les albums de 40+ pages. Rendu haut de gamme.', 0.00, '/images/options/reliure-dos-carre.jpg', 1),
  ('Spirale', 'spirale', 'Reliure spirale métallique. L''album s''ouvre à plat, pratique pour feuilleter. Parfait pour les albums du quotidien.', -2.00, '/images/options/reliure-spirale.jpg', 2),
  ('Agrafé', 'agrafe', 'Reliure agrafée au centre. Format magazine. Idéale pour les petits albums jusqu''à 48 pages.', -4.00, '/images/options/reliure-agrafe.jpg', 3)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- FORMATS
-- =====================
INSERT INTO public.formats (name, slug, width_cm, height_cm, description, base_price, image_url, display_order) VALUES
  ('A4 Portrait', 'a4-portrait', 21.0, 29.7, 'Format classique vertical. Idéal pour les albums de famille et les portraits.', 29.90, '/images/options/format-a4-portrait.jpg', 1),
  ('A4 Paysage', 'a4-paysage', 29.7, 21.0, 'Format horizontal panoramique. Parfait pour les photos de voyage et de paysages.', 29.90, '/images/options/format-a4-paysage.jpg', 2),
  ('Carré 21x21', 'carre-21', 21.0, 21.0, 'Format carré tendance. Moderne et élégant, s''adapte à tous les styles.', 24.90, '/images/options/format-carre.jpg', 3)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- PAPIERS INTÉRIEURS
-- =====================
INSERT INTO public.paper_types (name, slug, description, price_modifier, display_order) VALUES
  ('Mat premium 170g', 'mat-170', 'Papier mat doux au toucher. Pas de reflets, idéal pour la lecture. Rendu élégant et sobre.', 0.00, 1),
  ('Brillant 200g', 'brillant-200', 'Papier brillant qui fait ressortir les couleurs et les contrastes. Photos éclatantes.', 2.00, 2),
  ('Satiné 200g', 'satine-200', 'Compromis entre mat et brillant. Léger reflet soyeux, couleurs fidèles. Le plus populaire.', 3.00, 3)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- PELLICULAGES (couverture)
-- =====================
INSERT INTO public.lamination_types (name, slug, description, price_modifier, display_order) VALUES
  ('Mat', 'mat', 'Finition mate sur la couverture. Toucher doux et velouté. Aspect premium et moderne.', 0.00, 1),
  ('Brillant', 'brillant', 'Finition brillante sur la couverture. Couleurs vives et éclatantes. Effet "wow" garanti.', 0.00, 2),
  ('Soft Touch', 'soft-touch', 'Finition veloutée ultra-douce au toucher. Sensation de luxe. Résistant aux traces de doigts.', 4.00, 3)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- TYPES D'IMPRESSION
-- =====================
INSERT INTO public.printing_types (name, slug, description, price_modifier, display_order) VALUES
  ('Couleur', 'couleur', 'Impression en couleurs vives et fidèles. Rendu photographique haute définition.', 0.00, 1),
  ('Noir & Blanc', 'noir-blanc', 'Impression monochrome élégante. Idéale pour un rendu artistique et intemporel.', 0.00, 2)
ON CONFLICT (slug) DO NOTHING;

-- =====================
-- TEMPLATES DE MISE EN PAGE
-- =====================

-- 1 photo
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
  ('1-full', '1 photo pleine page', 1, '[{"x":0,"y":0,"w":100,"h":100}]', 'standard', 1),
  ('1-centered', '1 photo centrée', 1, '[{"x":10,"y":10,"w":80,"h":80}]', 'standard', 2),
  ('1-left', '1 photo à gauche', 1, '[{"x":5,"y":10,"w":55,"h":80}]', 'mixed', 3)
ON CONFLICT (id) DO NOTHING;

-- 2 photos
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
  ('2-horizontal', '2 photos côte à côte', 2, '[{"x":2,"y":10,"w":47,"h":80},{"x":51,"y":10,"w":47,"h":80}]', 'standard', 10),
  ('2-vertical', '2 photos empilées', 2, '[{"x":10,"y":2,"w":80,"h":47},{"x":10,"y":51,"w":80,"h":47}]', 'standard', 11),
  ('2-big-small', '1 grande + 1 petite', 2, '[{"x":2,"y":2,"w":60,"h":96},{"x":65,"y":25,"w":33,"h":50}]', 'standard', 12)
ON CONFLICT (id) DO NOTHING;

-- 4 photos
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
  ('4-grid', '4 photos en grille', 4, '[{"x":2,"y":2,"w":47,"h":47},{"x":51,"y":2,"w":47,"h":47},{"x":2,"y":51,"w":47,"h":47},{"x":51,"y":51,"w":47,"h":47}]', 'standard', 20),
  ('4-mosaic', '4 photos mosaïque', 4, '[{"x":2,"y":2,"w":47,"h":65},{"x":51,"y":2,"w":47,"h":30},{"x":51,"y":35,"w":47,"h":32},{"x":2,"y":70,"w":96,"h":28}]', 'standard', 21),
  ('4-strip', '4 photos en bande', 4, '[{"x":2,"y":2,"w":23,"h":96},{"x":27,"y":2,"w":23,"h":96},{"x":52,"y":2,"w":23,"h":96},{"x":77,"y":2,"w":21,"h":96}]', 'standard', 22)
ON CONFLICT (id) DO NOTHING;

-- 6 photos
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
  ('6-grid', '6 photos en grille', 6, '[{"x":2,"y":2,"w":31,"h":47},{"x":35,"y":2,"w":31,"h":47},{"x":68,"y":2,"w":30,"h":47},{"x":2,"y":51,"w":31,"h":47},{"x":35,"y":51,"w":31,"h":47},{"x":68,"y":51,"w":30,"h":47}]', 'standard', 30),
  ('6-mosaic', '6 photos mosaïque', 6, '[{"x":2,"y":2,"w":48,"h":48},{"x":52,"y":2,"w":23,"h":48},{"x":77,"y":2,"w":21,"h":48},{"x":2,"y":52,"w":23,"h":46},{"x":27,"y":52,"w":23,"h":46},{"x":52,"y":52,"w":46,"h":46}]', 'standard', 31)
ON CONFLICT (id) DO NOTHING;

-- 9 photos
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
  ('9-grid', '9 photos en grille', 9, '[{"x":1,"y":1,"w":32,"h":32},{"x":34,"y":1,"w":32,"h":32},{"x":67,"y":1,"w":32,"h":32},{"x":1,"y":34,"w":32,"h":32},{"x":34,"y":34,"w":32,"h":32},{"x":67,"y":34,"w":32,"h":32},{"x":1,"y":67,"w":32,"h":32},{"x":34,"y":67,"w":32,"h":32},{"x":67,"y":67,"w":32,"h":32}]', 'standard', 40)
ON CONFLICT (id) DO NOTHING;

-- Cover templates
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
  ('cover-full', 'Couverture photo pleine', 1, '[{"x":0,"y":0,"w":100,"h":100}]', 'cover', 50),
  ('cover-centered', 'Couverture photo centrée', 1, '[{"x":15,"y":15,"w":70,"h":70}]', 'cover', 51),
  ('cover-top', 'Couverture photo en haut', 1, '[{"x":5,"y":5,"w":90,"h":55}]', 'cover', 52)
ON CONFLICT (id) DO NOTHING;
