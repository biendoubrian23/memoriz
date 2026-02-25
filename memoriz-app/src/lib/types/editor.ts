/* ─────────────────────────────────────────────────────────────
   Memoriz — Shared types for the editor
   ───────────────────────────────────────────────────────────── */

export type GridCell = {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: "image" | "text";           // default = "image"
  placeholder?: string;               // e.g. "FASHION", "Subtitle"
  fontSize?: number;                  // relative % of cell height
  fontWeight?: "normal" | "bold";     // default bold
  textAlign?: "left" | "center" | "right";
  textColor?: string;                 // hex, default "#000000"
};

export type LayoutTemplate = {
  id: string;
  name: string;
  photo_count: number;
  grid_config: GridCell[] | AnyFreeformConfig;
  category: string;
  display_order: number;
  thumbnail_url?: string | null;       // optional preview image
  is_published?: boolean;              // false = draft (super_admin only)
};

export type PageElement = {
  id: string;
  page_id: string;
  element_type: "image" | "text" | "sticker" | "shape" | "line";
  content: string;
  position_x: number;
  position_y: number;
  width: number;
  height: number;
  rotation: number;
  z_index: number;
  styles: Record<string, unknown>;
};

/* ─── Freeform / Magazine premium types ─── */

export type FreeformElementType = "text" | "image" | "sticker" | "shape" | "line";

export type FreeformElement = {
  id: string;
  type: FreeformElementType;
  x: number;        // % of canvas width
  y: number;        // % of canvas height
  width: number;    // % of canvas width
  height: number;   // % of canvas height
  rotation: number; // degrees
  zIndex: number;
  opacity: number;
  locked?: boolean;

  // Text
  content?: string;
  fontFamily?: string;
  fontSize?: number;       // % of canvas height
  fontWeight?: string;
  fontStyle?: "normal" | "italic";
  letterSpacing?: number;  // em
  lineHeight?: number;     // multiplier
  textTransform?: "none" | "uppercase" | "lowercase" | "capitalize";
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  textShadow?: string;
  textDecoration?: string;

  // Image
  imageUrl?: string;
  objectFit?: "cover" | "contain" | "fill";
  objectPosition?: string;
  borderRadius?: number;
  clipPath?: string;

  // Shape
  shapeType?: "rectangle" | "circle" | "triangle" | "line";
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  borderStyle?: "solid" | "dashed" | "dotted";
};

/** Legacy freeform config with explicit element list */
export type MagazineFreeformConfig = {
  mode: "freeform";
  backgroundColor?: string;
  backgroundGradient?: string;
  elements: Omit<FreeformElement, "id">[];
};

/** New freeform config created by the Canva-like template editor (stores Fabric.js JSON) */
export type FabricFreeformConfig = {
  mode: "freeform";
  fabricJSON: string;
  pageType: string;
  /** Canvas width in px (used for aspect-ratio display) */
  width?: number;
  /** Canvas height in px (used for aspect-ratio display) */
  height?: number;
};

/** Union of both freeform config formats */
export type AnyFreeformConfig = MagazineFreeformConfig | FabricFreeformConfig;

/** Check if a grid_config is any kind of freeform (not a GridCell array) */
export function isFreeformConfig(
  config: unknown
): config is AnyFreeformConfig {
  return (
    config !== null &&
    typeof config === "object" &&
    !Array.isArray(config) &&
    (config as Record<string, unknown>).mode === "freeform"
  );
}

/** Check if a freeform config is specifically the legacy element-based format */
export function isMagazineConfig(
  config: unknown
): config is MagazineFreeformConfig {
  return (
    isFreeformConfig(config) &&
    Array.isArray((config as MagazineFreeformConfig).elements)
  );
}

/** Check if a freeform config is the new Fabric.js-based format */
export function isFabricConfig(
  config: unknown
): config is FabricFreeformConfig {
  return (
    isFreeformConfig(config) &&
    typeof (config as FabricFreeformConfig).fabricJSON === "string"
  );
}

/** Convert a DB PageElement row → FreeformElement */
export function pageElementToFreeform(el: PageElement): FreeformElement {
  const s = (el.styles ?? {}) as Record<string, unknown>;
  return {
    id: el.id,
    type: el.element_type as FreeformElementType,
    x: el.position_x,
    y: el.position_y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    zIndex: el.z_index,
    opacity: (s.opacity as number) ?? 1,
    locked: (s.locked as boolean) ?? false,
    content: el.element_type === "text" ? el.content : undefined,
    fontFamily: s.fontFamily as string | undefined,
    fontSize: s.fontSize as number | undefined,
    fontWeight: s.fontWeight as string | undefined,
    fontStyle: s.fontStyle as "normal" | "italic" | undefined,
    letterSpacing: s.letterSpacing as number | undefined,
    lineHeight: s.lineHeight as number | undefined,
    textTransform: s.textTransform as FreeformElement["textTransform"],
    textAlign: s.textAlign as FreeformElement["textAlign"],
    textColor: s.textColor as string | undefined,
    textShadow: s.textShadow as string | undefined,
    imageUrl: el.element_type === "image" ? el.content : undefined,
    objectFit: s.objectFit as FreeformElement["objectFit"],
    objectPosition: s.objectPosition as string | undefined,
    borderRadius: s.borderRadius as number | undefined,
    clipPath: s.clipPath as string | undefined,
    shapeType: s.shapeType as FreeformElement["shapeType"],
    fillColor: s.fillColor as string | undefined,
    strokeColor: s.strokeColor as string | undefined,
    strokeWidth: s.strokeWidth as number | undefined,
    borderStyle: s.borderStyle as FreeformElement["borderStyle"],
  };
}

/** Convert a FreeformElement → DB-ready object for page_elements */
export function freeformToDbRecord(
  el: FreeformElement,
  pageId: string
): Record<string, unknown> {
  return {
    ...(el.id.startsWith("temp-") ? {} : { id: el.id }),
    page_id: pageId,
    element_type: el.type,
    content:
      el.type === "text"
        ? (el.content ?? "")
        : (el.imageUrl ?? el.content ?? ""),
    position_x: el.x,
    position_y: el.y,
    width: el.width,
    height: el.height,
    rotation: el.rotation,
    z_index: el.zIndex,
    styles: {
      opacity: el.opacity,
      locked: el.locked,
      fontFamily: el.fontFamily,
      fontSize: el.fontSize,
      fontWeight: el.fontWeight,
      fontStyle: el.fontStyle,
      letterSpacing: el.letterSpacing,
      lineHeight: el.lineHeight,
      textTransform: el.textTransform,
      textAlign: el.textAlign,
      textColor: el.textColor,
      textShadow: el.textShadow,
      objectFit: el.objectFit,
      objectPosition: el.objectPosition,
      borderRadius: el.borderRadius,
      clipPath: el.clipPath,
      shapeType: el.shapeType,
      fillColor: el.fillColor,
      strokeColor: el.strokeColor,
      strokeWidth: el.strokeWidth,
      borderStyle: el.borderStyle,
    },
  };
}

export type ProjectPage = {
  id: string;
  project_id: string;
  page_number: number;
  page_type: "cover" | "content" | "back_cover" | "inner_cover" | "title";
  layout_id: string | null;
  background_color: string;
  /** Per-page Fabric.js canvas JSON (user customisations). NULL = use template as-is. */
  fabric_json?: string | null;
  /** Per-page thumbnail data URL generated from Fabric canvas */
  fabric_thumbnail?: string | null;
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

/* ── Product option types (for the sidebar "Options" tab) ── */
export type ProductOption = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  display_order: number;
  // Optional extra fields
  subtitle?: string;
  width_cm?: number;
  height_cm?: number;
};

export type ProjectOptions = {
  bindings: ProductOption[];
  formats: ProductOption[];
  papers: ProductOption[];
  laminations: ProductOption[];
  printings: ProductOption[];
};

export type SelectedOptions = {
  binding_type_id: string | null;
  format_id: string | null;
  paper_type_id: string | null;
  lamination_type_id: string | null;
  printing_type_id: string | null;
};
