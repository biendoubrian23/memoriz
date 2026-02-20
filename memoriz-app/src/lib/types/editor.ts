/* ─────────────────────────────────────────────────────────────
   Memoriz — Shared types for the editor
   ───────────────────────────────────────────────────────────── */

export type GridCell = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type LayoutTemplate = {
  id: string;
  name: string;
  photo_count: number;
  grid_config: GridCell[];
  category: string;
  display_order: number;
};

export type PageElement = {
  id: string;
  page_id: string;
  element_type: "image" | "text" | "sticker";
  content: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  styles: Record<string, unknown>;
};

export type ProjectPage = {
  id: string;
  project_id: string;
  page_number: number;
  page_type: "cover" | "content" | "back_cover" | "inner_cover" | "title";
  layout_id: string | null;
  background_color: string;
  elements?: PageElement[];
};

export type Project = {
  id: string;
  user_id: string;
  title: string;
  product_type: string;
  status: string;
  base_price: number;
  total_price: number;
  binding_type_id: string | null;
  format_id: string | null;
  paper_type_id: string | null;
  lamination_type_id: string | null;
  printing_type_id: string | null;
};

export type UserPhoto = {
  id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width: number | null;
  height: number | null;
  thumbnail_path: string | null;
  publicUrl?: string;
};
