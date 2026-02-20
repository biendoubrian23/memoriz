-- =============================================
-- Migration 007: Magazine-style layout templates
-- Adds templates with text zones (type=text) for
-- magazine/editorial designs
-- =============================================

-- Add thumbnail_url column to layout_templates (optional)
ALTER TABLE public.layout_templates
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

-- Update the category CHECK constraint to allow new theme categories
ALTER TABLE public.layout_templates
  DROP CONSTRAINT IF EXISTS layout_templates_category_check;

ALTER TABLE public.layout_templates
  ADD CONSTRAINT layout_templates_category_check
  CHECK (category IN ('standard', 'text', 'mixed', 'cover', 'magazine', 'famille', 'road-trip', 'mariage', 'bebe'));

-- ─── Magazine cover: large photo + title + subtitle (Fashion style) ───
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
(
  'mag-cover-fashion',
  'Couverture Magazine',
  1,
  '[
    {"x":0,"y":0,"w":100,"h":100,"type":"image"},
    {"x":8,"y":3,"w":84,"h":10,"type":"text","placeholder":"TITRE","fontSize":90,"fontWeight":"bold","textAlign":"center","textColor":"#FFFFFF"},
    {"x":5,"y":60,"w":50,"h":18,"type":"text","placeholder":"The Latest\nLuxury Style","fontSize":50,"fontWeight":"bold","textAlign":"left","textColor":"#FFFFFF"},
    {"x":55,"y":62,"w":40,"h":8,"type":"text","placeholder":"20\nBEST MODELS","fontSize":35,"fontWeight":"bold","textAlign":"center","textColor":"#FFFFFF"},
    {"x":5,"y":82,"w":90,"h":5,"type":"text","placeholder":"Description...","fontSize":25,"fontWeight":"normal","textAlign":"left","textColor":"#FFFFFF"}
  ]',
  'magazine',
  60
)
ON CONFLICT (id) DO UPDATE SET grid_config = EXCLUDED.grid_config, name = EXCLUDED.name;

-- ─── Magazine cover: photo + top brand + large title (Numera style) ───
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
(
  'mag-cover-editorial',
  'Couverture Éditoriale',
  1,
  '[
    {"x":0,"y":0,"w":100,"h":100,"type":"image"},
    {"x":20,"y":2,"w":60,"h":5,"type":"text","placeholder":"Studio Name","fontSize":28,"fontWeight":"normal","textAlign":"center","textColor":"#000000"},
    {"x":5,"y":6,"w":90,"h":14,"type":"text","placeholder":"Numera","fontSize":100,"fontWeight":"bold","textAlign":"center","textColor":"#CC0000"},
    {"x":3,"y":35,"w":35,"h":10,"type":"text","placeholder":"Soft\nStructure","fontSize":35,"fontWeight":"bold","textAlign":"left","textColor":"#000000"},
    {"x":3,"y":46,"w":40,"h":8,"type":"text","placeholder":"Refined silhouettes in\nwarm neutrals","fontSize":25,"fontWeight":"bold","textAlign":"left","textColor":"#000000"},
    {"x":55,"y":60,"w":40,"h":12,"type":"text","placeholder":"Everyday\nLayers","fontSize":35,"fontWeight":"bold","textAlign":"right","textColor":"#000000"},
    {"x":15,"y":90,"w":70,"h":5,"type":"text","placeholder":"Discover more at site.com","fontSize":22,"fontWeight":"normal","textAlign":"center","textColor":"#000000"}
  ]',
  'magazine',
  61
)
ON CONFLICT (id) DO UPDATE SET grid_config = EXCLUDED.grid_config, name = EXCLUDED.name;

-- ─── Interior: 1 photo + text overlay (article intro) ───
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
(
  'mag-article-hero',
  'Article — Héro',
  1,
  '[
    {"x":0,"y":0,"w":100,"h":65,"type":"image"},
    {"x":8,"y":68,"w":84,"h":8,"type":"text","placeholder":"Titre de l''article","fontSize":55,"fontWeight":"bold","textAlign":"left","textColor":"#000000"},
    {"x":8,"y":78,"w":84,"h":18,"type":"text","placeholder":"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.","fontSize":22,"fontWeight":"normal","textAlign":"left","textColor":"#333333"}
  ]',
  'magazine',
  62
)
ON CONFLICT (id) DO UPDATE SET grid_config = EXCLUDED.grid_config, name = EXCLUDED.name;

-- ─── Interior: 2 photos + title + paragraph ───
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
(
  'mag-2photo-text',
  '2 Photos + Texte',
  2,
  '[
    {"x":3,"y":3,"w":45,"h":50,"type":"image"},
    {"x":52,"y":3,"w":45,"h":50,"type":"image"},
    {"x":3,"y":56,"w":94,"h":8,"type":"text","placeholder":"Titre de section","fontSize":50,"fontWeight":"bold","textAlign":"center","textColor":"#000000"},
    {"x":8,"y":66,"w":84,"h":30,"type":"text","placeholder":"Découvrez notre sélection exclusive. Chaque pièce a été choisie avec soin pour son élégance et sa qualité.","fontSize":22,"fontWeight":"normal","textAlign":"center","textColor":"#444444"}
  ]',
  'magazine',
  63
)
ON CONFLICT (id) DO UPDATE SET grid_config = EXCLUDED.grid_config, name = EXCLUDED.name;

-- ─── Interior: 1 large photo left + text right (editorial) ───
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
(
  'mag-photo-text-split',
  'Photo + Texte côte à côte',
  1,
  '[
    {"x":0,"y":0,"w":55,"h":100,"type":"image"},
    {"x":60,"y":10,"w":35,"h":10,"type":"text","placeholder":"Section Title","fontSize":45,"fontWeight":"bold","textAlign":"left","textColor":"#000000"},
    {"x":60,"y":22,"w":35,"h":55,"type":"text","placeholder":"Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Cras mattis consectetur purus sit amet fermentum.","fontSize":20,"fontWeight":"normal","textAlign":"left","textColor":"#555555"},
    {"x":60,"y":82,"w":35,"h":5,"type":"text","placeholder":"— Author Name","fontSize":18,"fontWeight":"normal","textAlign":"right","textColor":"#999999"}
  ]',
  'magazine',
  64
)
ON CONFLICT (id) DO UPDATE SET grid_config = EXCLUDED.grid_config, name = EXCLUDED.name;

-- ─── Full text page (quote / poem) ───
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
(
  'mag-full-text',
  'Page texte complète',
  0,
  '[
    {"x":10,"y":10,"w":80,"h":12,"type":"text","placeholder":"Titre","fontSize":60,"fontWeight":"bold","textAlign":"center","textColor":"#000000"},
    {"x":10,"y":28,"w":80,"h":50,"type":"text","placeholder":"Votre texte ici...\n\nÉcrivez une citation, un poème, ou le texte de votre choix pour personnaliser cette page.","fontSize":22,"fontWeight":"normal","textAlign":"center","textColor":"#333333"},
    {"x":25,"y":82,"w":50,"h":5,"type":"text","placeholder":"— Auteur","fontSize":20,"fontWeight":"normal","textAlign":"center","textColor":"#888888"}
  ]',
  'magazine',
  65
)
ON CONFLICT (id) DO UPDATE SET grid_config = EXCLUDED.grid_config, name = EXCLUDED.name;

-- ─── Interior: collage 3 photos + title overlay (mood board) ───
INSERT INTO public.layout_templates (id, name, photo_count, grid_config, category, display_order) VALUES
(
  'mag-mood-board',
  'Mood Board',
  3,
  '[
    {"x":0,"y":0,"w":60,"h":55,"type":"image"},
    {"x":62,"y":0,"w":38,"h":55,"type":"image"},
    {"x":0,"y":57,"w":50,"h":43,"type":"image"},
    {"x":52,"y":57,"w":48,"h":10,"type":"text","placeholder":"MOOD BOARD","fontSize":45,"fontWeight":"bold","textAlign":"left","textColor":"#000000"},
    {"x":52,"y":68,"w":46,"h":30,"type":"text","placeholder":"Une collection d''images qui capturent l''essence de votre vision créative.","fontSize":20,"fontWeight":"normal","textAlign":"left","textColor":"#555555"}
  ]',
  'magazine',
  66
)
ON CONFLICT (id) DO UPDATE SET grid_config = EXCLUDED.grid_config, name = EXCLUDED.name;
