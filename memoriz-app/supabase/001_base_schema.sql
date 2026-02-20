-- ============================================================
-- Memoriz - Schema de base de données v001
-- Fichier: 001_base_schema.sql
-- Description: Tables fondamentales (profils, produits, projets, pages, éléments, photos, panier, commandes)
-- ============================================================

-- =====================
-- 1. PROFILES (extends auth.users)
-- =====================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  first_name TEXT NOT NULL DEFAULT '',
  last_name TEXT NOT NULL DEFAULT '',
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================
-- 2. OPTIONS PRODUIT
-- =====================

-- Types de reliure
CREATE TABLE IF NOT EXISTS public.binding_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Formats
CREATE TABLE IF NOT EXISTS public.formats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  width_cm DECIMAL(5,1),
  height_cm DECIMAL(5,1),
  description TEXT,
  base_price DECIMAL(10,2) DEFAULT 0,
  image_url TEXT,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Types de papier intérieur
CREATE TABLE IF NOT EXISTS public.paper_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Types de pelliculage
CREATE TABLE IF NOT EXISTS public.lamination_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Types d'impression
CREATE TABLE IF NOT EXISTS public.printing_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 3. PROJETS
-- =====================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT DEFAULT 'Mon album',
  product_type TEXT DEFAULT 'album' CHECK (product_type IN ('album', 'magazine', 'livre')),
  binding_type_id UUID REFERENCES public.binding_types(id),
  format_id UUID REFERENCES public.formats(id),
  paper_type_id UUID REFERENCES public.paper_types(id),
  lamination_type_id UUID REFERENCES public.lamination_types(id),
  printing_type_id UUID REFERENCES public.printing_types(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'in_cart', 'ordered')),
  page_count INT DEFAULT 24,
  cover_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 4. PAGES DU PROJET
-- =====================
CREATE TABLE IF NOT EXISTS public.project_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  page_number INT NOT NULL,
  page_type TEXT DEFAULT 'content' CHECK (page_type IN ('cover', 'inner_cover', 'title', 'content', 'back_cover')),
  layout_template TEXT DEFAULT '1-full',
  background_color TEXT DEFAULT '#FFFFFF',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, page_number)
);

-- =====================
-- 5. ÉLÉMENTS DE PAGE
-- =====================
CREATE TABLE IF NOT EXISTS public.page_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES public.project_pages(id) ON DELETE CASCADE NOT NULL,
  element_type TEXT NOT NULL CHECK (element_type IN ('image', 'text', 'sticker')),
  content TEXT,
  slot_index INT DEFAULT 0,
  position_x DECIMAL(10,2) DEFAULT 0,
  position_y DECIMAL(10,2) DEFAULT 0,
  width DECIMAL(10,2) DEFAULT 100,
  height DECIMAL(10,2) DEFAULT 100,
  rotation DECIMAL(5,2) DEFAULT 0,
  z_index INT DEFAULT 0,
  styles JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 6. PHOTOS UPLOADÉES
-- =====================
CREATE TABLE IF NOT EXISTS public.user_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  width INT,
  height INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 7. TEMPLATES DE MISE EN PAGE
-- =====================
CREATE TABLE IF NOT EXISTS public.layout_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  photo_count INT NOT NULL,
  grid_config JSONB NOT NULL,
  category TEXT DEFAULT 'standard' CHECK (category IN ('standard', 'text', 'mixed', 'cover')),
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================
-- 8. PANIER
-- =====================
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);

-- =====================
-- 9. COMMANDES
-- =====================
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  order_number TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_price DECIMAL(10,2) NOT NULL,
  shipping_address JSONB,
  shipping_method TEXT,
  shipping_price DECIMAL(10,2) DEFAULT 0,
  payment_method TEXT,
  payment_id TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  product_title TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  config_snapshot JSONB
);

-- =====================
-- 10. RLS (Row Level Security)
-- =====================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Projects: users can CRUD their own projects
CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create projects" ON public.projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE USING (auth.uid() = user_id);

-- Project pages: via project ownership
CREATE POLICY "Users can view own pages" ON public.project_pages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_pages.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can create pages" ON public.project_pages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_pages.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can update own pages" ON public.project_pages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_pages.project_id AND projects.user_id = auth.uid()));
CREATE POLICY "Users can delete own pages" ON public.project_pages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.projects WHERE projects.id = project_pages.project_id AND projects.user_id = auth.uid()));

-- Page elements: via project ownership
CREATE POLICY "Users can view own elements" ON public.page_elements FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.project_pages pp
    JOIN public.projects p ON p.id = pp.project_id
    WHERE pp.id = page_elements.page_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "Users can create elements" ON public.page_elements FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.project_pages pp
    JOIN public.projects p ON p.id = pp.project_id
    WHERE pp.id = page_elements.page_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "Users can update own elements" ON public.page_elements FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.project_pages pp
    JOIN public.projects p ON p.id = pp.project_id
    WHERE pp.id = page_elements.page_id AND p.user_id = auth.uid()
  ));
CREATE POLICY "Users can delete own elements" ON public.page_elements FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.project_pages pp
    JOIN public.projects p ON p.id = pp.project_id
    WHERE pp.id = page_elements.page_id AND p.user_id = auth.uid()
  ));

-- User photos: users can CRUD their own photos
CREATE POLICY "Users can view own photos" ON public.user_photos FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload photos" ON public.user_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own photos" ON public.user_photos FOR DELETE USING (auth.uid() = user_id);

-- Cart: users can CRUD their own cart
CREATE POLICY "Users can view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can add to cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete from cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

-- Orders: users can view their own orders
CREATE POLICY "Users can view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: via order ownership
CREATE POLICY "Users can view own order items" ON public.order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Product option tables: readable by everyone (no auth required)
ALTER TABLE public.binding_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.formats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paper_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lamination_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.printing_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layout_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read binding types" ON public.binding_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read formats" ON public.formats FOR SELECT USING (true);
CREATE POLICY "Anyone can read paper types" ON public.paper_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read lamination types" ON public.lamination_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read printing types" ON public.printing_types FOR SELECT USING (true);
CREATE POLICY "Anyone can read layout templates" ON public.layout_templates FOR SELECT USING (true);

-- =====================
-- 11. STORAGE BUCKET
-- =====================
-- À exécuter dans le dashboard Supabase > Storage:
-- Créer un bucket "user-photos" en mode privé
-- Politique: les utilisateurs authentifiés peuvent upload dans leur propre dossier

-- =====================
-- 12. INDEXES
-- =====================
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON public.projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_pages_project_id ON public.project_pages(project_id);
CREATE INDEX IF NOT EXISTS idx_page_elements_page_id ON public.page_elements(page_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON public.user_photos(user_id);
CREATE INDEX IF NOT EXISTS idx_user_photos_project_id ON public.user_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON public.cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON public.order_items(order_id);
