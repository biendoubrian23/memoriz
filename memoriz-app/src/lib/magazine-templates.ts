/* ─────────────────────────────────────────────────────────────
   Memoriz — Premium Magazine Template Definitions

   Each template is a pixel-perfect recreation of the reference
   visuals with real placeholder stock images from Unsplash.
   All positions / sizes are in % of canvas dimensions.
   fontSize is in % of canvas height for proportional scaling.
   ───────────────────────────────────────────────────────────── */

import type { MagazineFreeformConfig, FreeformElement, LayoutTemplate } from "./types/editor";

export type MagazineTemplateDef = {
  id: string;
  name: string;
  category: string;
  photo_count: number;
  config: MagazineFreeformConfig;
  /** Preview accent color for sidebar mini-rendering */
  previewAccent?: string;
};

/* ─── Curated Google Fonts for magazine templates ─── */
export const MAGAZINE_FONTS = [
  { family: "Playfair Display", weights: [400, 700, 900] },
  { family: "DM Serif Display", weights: [400] },
  { family: "Cormorant Garamond", weights: [300, 400, 600, 700] },
  { family: "Great Vibes", weights: [400] },
  { family: "Montserrat", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Poppins", weights: [300, 400, 500, 600, 700] },
  { family: "Dancing Script", weights: [400, 700] },
  { family: "Oswald", weights: [300, 400, 500, 600, 700] },
  { family: "Lora", weights: [400, 500, 600, 700] },
  { family: "Raleway", weights: [300, 400, 500, 600, 700, 800] },
  { family: "Caveat", weights: [400, 700] },
  { family: "Libre Baskerville", weights: [400, 700] },
  { family: "Abril Fatface", weights: [400] },
  { family: "Bodoni Moda", weights: [400, 500, 600, 700, 900] },
  { family: "Italiana", weights: [400] },
];

/** Build the Google Fonts <link> URL */
export function getGoogleFontsUrl(): string {
  const families = MAGAZINE_FONTS.map(
    (f) => `family=${f.family.replace(/ /g, "+")}:ital,wght@0,${f.weights.join(";0,")};1,${f.weights.join(";1,")}`
  ).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** All available font family names */
export const FONT_FAMILIES = MAGAZINE_FONTS.map((f) => f.family);

/* ─── Unsplash CDN-hosted placeholder images ─── */
const PH = (id: string, w = 800, h = 1200) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

/* Common text shadows for white text on photos */
const SHADOW = "0 2px 12px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.4)";
const SHADOW_SM = "0 1px 6px rgba(0,0,0,0.5)";

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 1 — Numera Fashion Magazine
   Full-bleed editorial photo • Bold red masthead • Vogue style
   ═══════════════════════════════════════════════════════════════ */
const numeraFashion: MagazineTemplateDef = {
  id: "mag-numera-fashion",
  name: "Numera Fashion",
  category: "magazine",
  photo_count: 1,
  previewAccent: "#c9184a",
  config: {
    mode: "freeform",
    backgroundGradient: "linear-gradient(170deg, #2b2d42 0%, #8d99ae 50%, #edf2f4 100%)",
    backgroundColor: "#2b2d42",
    elements: [
      // Full-bleed hero photo
      { type: "image", x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 1, opacity: 1,
        objectFit: "cover", imageUrl: PH("1509631179647-0177331693ae") },
      // Bottom gradient overlay for text legibility
      { type: "shape", x: 0, y: 55, width: 100, height: 45, rotation: 0, zIndex: 2, opacity: 0.55,
        shapeType: "rectangle", fillColor: "#0d0d0d" },
      // Top vignette for masthead legibility
      { type: "shape", x: 0, y: 0, width: 100, height: 22, rotation: 0, zIndex: 2, opacity: 0.35,
        shapeType: "rectangle", fillColor: "#0d0d0d" },
      // "Lunare Studio" — subtitle above masthead
      { type: "text", x: 20, y: 2, width: 60, height: 3.5, rotation: 0, zIndex: 10, opacity: 1,
        content: "Lunare Studio", fontFamily: "Montserrat", fontSize: 1.8, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", letterSpacing: 0.25, lineHeight: 1,
        textShadow: SHADOW_SM },
      // "NUMERA" — MASTHEAD (huge, dominant, red accent)
      { type: "text", x: 0, y: 5, width: 100, height: 14, rotation: 0, zIndex: 10, opacity: 1,
        content: "NUMERA", fontFamily: "Bodoni Moda", fontSize: 13.5, fontWeight: "900",
        textColor: "#c9184a", textAlign: "center", letterSpacing: 0.06, lineHeight: 0.85,
        textShadow: "0 2px 12px rgba(0,0,0,0.3)" },
      // "Soft Structure" — left accent (italic)
      { type: "text", x: 3, y: 57, width: 24, height: 7, rotation: 0, zIndex: 10, opacity: 1,
        content: "Soft\nStructure", fontFamily: "Playfair Display", fontSize: 2.8, fontWeight: "400",
        fontStyle: "italic", textColor: "#ffffff", textAlign: "left", lineHeight: 1.15,
        textShadow: SHADOW },
      // Left description
      { type: "text", x: 3, y: 64, width: 24, height: 6, rotation: 0, zIndex: 10, opacity: 0.85,
        content: "Refined silhouettes\nin warm neutrals", fontFamily: "Montserrat", fontSize: 1.4, fontWeight: "500",
        textColor: "#ffffff", textAlign: "left", lineHeight: 1.35, textShadow: SHADOW_SM },
      // "Everyday Layers" — right accent (italic)
      { type: "text", x: 65, y: 57, width: 32, height: 6, rotation: 0, zIndex: 10, opacity: 1,
        content: "Everyday\nLayers", fontFamily: "Playfair Display", fontSize: 2.8, fontWeight: "400",
        fontStyle: "italic", textColor: "#ffffff", textAlign: "right", lineHeight: 1.15,
        textShadow: SHADOW },
      // Right description
      { type: "text", x: 63, y: 63, width: 34, height: 6, rotation: 0, zIndex: 10, opacity: 0.85,
        content: "Comfort meets\nquiet elegance", fontFamily: "Montserrat", fontSize: 1.4, fontWeight: "500",
        textColor: "#ffffff", textAlign: "right", lineHeight: 1.35, textShadow: SHADOW_SM },
      // "Elevations" — large feature text at bottom
      { type: "text", x: 3, y: 78, width: 94, height: 13, rotation: 0, zIndex: 10, opacity: 1,
        content: "Elevations", fontFamily: "Bodoni Moda", fontSize: 12, fontWeight: "400",
        textColor: "#ffffff", textAlign: "left", lineHeight: 0.9, letterSpacing: -0.01,
        textShadow: SHADOW },
      // CTA border box
      { type: "shape", x: 15, y: 93, width: 70, height: 4.5, rotation: 0, zIndex: 9, opacity: 0.6,
        shapeType: "rectangle", fillColor: "transparent", strokeColor: "#ffffff", strokeWidth: 1 },
      // CTA text
      { type: "text", x: 15, y: 93.5, width: 70, height: 3.5, rotation: 0, zIndex: 10, opacity: 0.9,
        content: "Discover more at lunarestudio.com", fontFamily: "Montserrat", fontSize: 1.2,
        fontWeight: "400", textColor: "#ffffff", textAlign: "center", letterSpacing: 0.12, lineHeight: 1 },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 2 — Henderson Family Album
   Dark header banner + 7-photo mosaic on warm beige
   ═══════════════════════════════════════════════════════════════ */
const hendersonFamily: MagazineTemplateDef = {
  id: "mag-henderson-family",
  name: "Henderson Family",
  category: "famille",
  photo_count: 7,
  previewAccent: "#3d3029",
  config: {
    mode: "freeform",
    backgroundColor: "#f5f0eb",
    elements: [
      // Dark header banner
      { type: "shape", x: 0, y: 0, width: 100, height: 22, rotation: 0, zIndex: 1, opacity: 1,
        shapeType: "rectangle", fillColor: "#3d3029" },
      // "HENDERSON"
      { type: "text", x: 10, y: 4, width: 80, height: 8, rotation: 0, zIndex: 10, opacity: 1,
        content: "HENDERSON", fontFamily: "Bodoni Moda", fontSize: 6, fontWeight: "700",
        textColor: "#ffffff", textAlign: "center", letterSpacing: 0.15, lineHeight: 1 },
      // "FAMILY ALBUM"
      { type: "text", x: 20, y: 12, width: 60, height: 5, rotation: 0, zIndex: 10, opacity: 1,
        content: "FAMILY ALBUM", fontFamily: "Montserrat", fontSize: 2.2, fontWeight: "300",
        textColor: "#ffffff", textAlign: "center", letterSpacing: 0.3, lineHeight: 1 },
      // Decorative separator line
      { type: "shape", x: 35, y: 18, width: 30, height: 0.3, rotation: 0, zIndex: 10, opacity: 0.4,
        shapeType: "line", strokeColor: "#ffffff", strokeWidth: 1 },
      // Row 1: 3 photos
      { type: "image", x: 2, y: 24, width: 30, height: 24, rotation: 0, zIndex: 2, opacity: 1,
        objectFit: "cover", imageUrl: PH("1511895426328-dc8714191300", 600, 400) },
      { type: "image", x: 34, y: 24, width: 32, height: 28, rotation: 0, zIndex: 2, opacity: 1,
        objectFit: "cover", imageUrl: PH("1609220136736-443140cffec6", 600, 500) },
      { type: "image", x: 68, y: 24, width: 30, height: 24, rotation: 0, zIndex: 2, opacity: 1,
        objectFit: "cover", imageUrl: PH("1581952976147-5a2d15560349", 600, 400) },
      // Row 2: 2 photos + 1 tall
      { type: "image", x: 2, y: 50, width: 30, height: 22, rotation: 0, zIndex: 2, opacity: 1,
        objectFit: "cover", imageUrl: PH("1475688621402-4257c812d6db", 600, 400) },
      { type: "image", x: 34, y: 54, width: 30, height: 20, rotation: 0, zIndex: 2, opacity: 1,
        objectFit: "cover", imageUrl: PH("1596464716127-f2a6f065aa1e", 600, 400) },
      // Tall right photo spanning rows 2-3
      { type: "image", x: 66, y: 50, width: 32, height: 28, rotation: 0, zIndex: 2, opacity: 1,
        objectFit: "cover", imageUrl: PH("1478061653917-455ba7f4a541", 600, 500) },
      // Row 3 single photo
      { type: "image", x: 34, y: 76, width: 30, height: 20, rotation: 0, zIndex: 2, opacity: 1,
        objectFit: "cover", imageUrl: PH("1542037104857-ffbb0b9155fb", 600, 400) },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 3 — Love in Frames
   Heart-shaped collage on soft pink watercolor
   ═══════════════════════════════════════════════════════════════ */
const loveInFrames: MagazineTemplateDef = {
  id: "mag-love-in-frames",
  name: "Love in Frames",
  category: "famille",
  photo_count: 6,
  previewAccent: "#c06060",
  config: {
    mode: "freeform",
    backgroundColor: "#fdf2f0",
    elements: [
      // Soft pink watercolor wash
      { type: "shape", x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 0, opacity: 0.12,
        shapeType: "rectangle", fillColor: "#f8c4c0" },
      // "Love in frames" — script title
      { type: "text", x: 10, y: 3, width: 80, height: 10, rotation: 0, zIndex: 10, opacity: 1,
        content: "Love in frames", fontFamily: "Great Vibes", fontSize: 7, fontWeight: "400",
        textColor: "#3d2520", textAlign: "center", lineHeight: 1 },
      // Heart-shaped photo arrangement — top row
      { type: "image", x: 18, y: 15, width: 18, height: 14, rotation: -5, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1529634597503-139d3726fed5", 400, 300), borderRadius: 4 },
      { type: "image", x: 40, y: 14, width: 20, height: 15, rotation: 2, zIndex: 4, opacity: 1,
        objectFit: "cover", imageUrl: PH("1545389336-cf090694435e", 400, 300), borderRadius: 4 },
      { type: "image", x: 63, y: 15, width: 18, height: 14, rotation: 5, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1516589178581-6cd7833ae3b2", 400, 300), borderRadius: 4 },
      // Middle row — wider photos converging to heart point
      { type: "image", x: 12, y: 31, width: 22, height: 16, rotation: -3, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1518199266791-5375a83190b7", 400, 300), borderRadius: 4 },
      { type: "image", x: 38, y: 30, width: 24, height: 18, rotation: 0, zIndex: 5, opacity: 1,
        objectFit: "cover", imageUrl: PH("1522673607200-164d1b6ce486", 500, 400), borderRadius: 4 },
      { type: "image", x: 66, y: 31, width: 22, height: 16, rotation: 4, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1519741497674-611481863552", 400, 300), borderRadius: 4 },
      // "MEMORY" letter blocks
      { type: "text", x: 14, y: 54, width: 10, height: 7, rotation: 0, zIndex: 10, opacity: 1,
        content: "M", fontFamily: "Bodoni Moda", fontSize: 4, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", fillColor: "#5c3a2e", borderRadius: 4 },
      { type: "text", x: 25.5, y: 54, width: 10, height: 7, rotation: 0, zIndex: 10, opacity: 1,
        content: "E", fontFamily: "Bodoni Moda", fontSize: 4, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", fillColor: "#5c3a2e", borderRadius: 4 },
      { type: "text", x: 37, y: 54, width: 10, height: 7, rotation: 0, zIndex: 10, opacity: 1,
        content: "M", fontFamily: "Bodoni Moda", fontSize: 4, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", fillColor: "#5c3a2e", borderRadius: 4 },
      { type: "text", x: 48.5, y: 54, width: 10, height: 7, rotation: 0, zIndex: 10, opacity: 1,
        content: "O", fontFamily: "Bodoni Moda", fontSize: 4, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", fillColor: "#5c3a2e", borderRadius: 4 },
      { type: "text", x: 60, y: 54, width: 10, height: 7, rotation: 0, zIndex: 10, opacity: 1,
        content: "R", fontFamily: "Bodoni Moda", fontSize: 4, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", fillColor: "#5c3a2e", borderRadius: 4 },
      { type: "text", x: 71.5, y: 54, width: 10, height: 7, rotation: 0, zIndex: 10, opacity: 1,
        content: "Y", fontFamily: "Bodoni Moda", fontSize: 4, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", fillColor: "#5c3a2e", borderRadius: 4 },
      // "Every picture tells our story"
      { type: "text", x: 10, y: 85, width: 80, height: 6, rotation: 0, zIndex: 10, opacity: 1,
        content: "Every picture tells our story", fontFamily: "Great Vibes", fontSize: 4.5, fontWeight: "400",
        textColor: "#3d2520", textAlign: "center", lineHeight: 1 },
      // @handle
      { type: "text", x: 25, y: 91, width: 50, height: 3, rotation: 0, zIndex: 10, opacity: 0.5,
        content: "@votrecompte", fontFamily: "Montserrat", fontSize: 1.4, fontWeight: "400",
        textColor: "#3d2520", textAlign: "center", lineHeight: 1 },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 4 — Together Couple Magazine
   Elegant full-bleed + massive serif masthead
   ═══════════════════════════════════════════════════════════════ */
const togetherCouple: MagazineTemplateDef = {
  id: "mag-together-couple",
  name: "Together",
  category: "magazine",
  photo_count: 1,
  previewAccent: "#d4a373",
  config: {
    mode: "freeform",
    backgroundGradient: "linear-gradient(180deg, #a8926e 0%, #d4a373 50%, #f5e6d3 100%)",
    backgroundColor: "#a8926e",
    elements: [
      // Full-bleed couple photo
      { type: "image", x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 1, opacity: 1,
        objectFit: "cover", imageUrl: PH("1522673607200-164d1b6ce486") },
      // Bottom gradient overlay
      { type: "shape", x: 0, y: 50, width: 100, height: 50, rotation: 0, zIndex: 2, opacity: 0.45,
        shapeType: "rectangle", fillColor: "#1a1a1a" },
      // Top vignette
      { type: "shape", x: 0, y: 0, width: 100, height: 20, rotation: 0, zIndex: 2, opacity: 0.3,
        shapeType: "rectangle", fillColor: "#1a1a1a" },
      // "Together" — MASSIVE masthead
      { type: "text", x: 2, y: 2, width: 96, height: 14, rotation: 0, zIndex: 10, opacity: 1,
        content: "Together", fontFamily: "Bodoni Moda", fontSize: 13, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", lineHeight: 0.9, letterSpacing: -0.01,
        textShadow: SHADOW },
      // Small subtitle right
      { type: "text", x: 60, y: 14, width: 38, height: 2.5, rotation: 0, zIndex: 10, opacity: 0.7,
        content: "MIPHONA CURTOR", fontFamily: "Montserrat", fontSize: 1.1, fontWeight: "400",
        textColor: "#ffffff", textAlign: "right", letterSpacing: 0.15, textTransform: "uppercase",
        textShadow: SHADOW_SM },
      // "The Power Couple Issue" — left block
      { type: "text", x: 4, y: 56, width: 28, height: 18, rotation: 0, zIndex: 10, opacity: 1,
        content: "The\nPower\nCouple\nIssue", fontFamily: "Bodoni Moda", fontSize: 3.2, fontWeight: "400",
        textColor: "#ffffff", textAlign: "left", lineHeight: 1.1,
        textShadow: SHADOW },
      // Accent line
      { type: "shape", x: 4, y: 73, width: 20, height: 0.3, rotation: 0, zIndex: 10, opacity: 0.6,
        shapeType: "line", strokeColor: "#ffffff", strokeWidth: 1 },
      // "An inside look at their journey."
      { type: "text", x: 55, y: 80, width: 42, height: 10, rotation: 0, zIndex: 10, opacity: 1,
        content: "An inside look\nat their journey.", fontFamily: "Bodoni Moda", fontSize: 2.8, fontWeight: "400",
        textColor: "#ffffff", textAlign: "right", lineHeight: 1.2,
        textShadow: SHADOW },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 5 — COUPLE Magazine (Wedding)
   Bold "COUPLE" masthead + date + bottom name bar
   ═══════════════════════════════════════════════════════════════ */
const coupleWedding: MagazineTemplateDef = {
  id: "mag-couple-wedding",
  name: "Couple Magazine",
  category: "magazine",
  photo_count: 1,
  previewAccent: "#2d6a4f",
  config: {
    mode: "freeform",
    backgroundGradient: "linear-gradient(180deg, #40916c 0%, #2d6a4f 60%, #1b4332 100%)",
    backgroundColor: "#2d6a4f",
    elements: [
      // Full-bleed wedding photo (85% height)
      { type: "image", x: 0, y: 0, width: 100, height: 85, rotation: 0, zIndex: 1, opacity: 1,
        objectFit: "cover", imageUrl: PH("1519741497674-611481863552") },
      // Top vignette
      { type: "shape", x: 0, y: 0, width: 100, height: 25, rotation: 0, zIndex: 2, opacity: 0.35,
        shapeType: "rectangle", fillColor: "#0d0d0d" },
      // Mid-left vignette
      { type: "shape", x: 0, y: 20, width: 35, height: 40, rotation: 0, zIndex: 2, opacity: 0.3,
        shapeType: "rectangle", fillColor: "#0d0d0d" },
      // "COUPLE" — MASSIVE bold masthead
      { type: "text", x: 0, y: 1, width: 72, height: 16, rotation: 0, zIndex: 10, opacity: 1,
        content: "COUPLE", fontFamily: "Bodoni Moda", fontSize: 14.5, fontWeight: "900",
        textColor: "#ffffff", textAlign: "center", lineHeight: 0.85, letterSpacing: -0.02,
        textShadow: "0 3px 15px rgba(0,0,0,0.5)" },
      // "MAGAZINE" — right of masthead
      { type: "text", x: 70, y: 5, width: 28, height: 5, rotation: 0, zIndex: 10, opacity: 1,
        content: "MAGAZINE", fontFamily: "Montserrat", fontSize: 2.2, fontWeight: "300",
        textColor: "#ffffff", textAlign: "left", letterSpacing: 0.3,
        textShadow: SHADOW_SM },
      // Date top right
      { type: "text", x: 76, y: 1, width: 22, height: 3, rotation: 0, zIndex: 10, opacity: 0.8,
        content: "8.5.11", fontFamily: "Montserrat", fontSize: 1.5, fontWeight: "400",
        textColor: "#ffffff", textAlign: "right", textShadow: SHADOW_SM },
      // "The Greatest Love Story"
      { type: "text", x: 3, y: 25, width: 28, height: 18, rotation: 0, zIndex: 10, opacity: 1,
        content: "The\nGreatest\nLove\nStory", fontFamily: "Bodoni Moda", fontSize: 4.2, fontWeight: "400",
        textColor: "#ffffff", textAlign: "left", lineHeight: 1.1,
        textShadow: SHADOW },
      // Description
      { type: "text", x: 3, y: 43, width: 28, height: 10, rotation: 0, zIndex: 10, opacity: 0.8,
        content: "An exclusive look into\ntheir world of romance,\nmemories & milestones.", fontFamily: "Montserrat", fontSize: 1.3, fontWeight: "400",
        textColor: "#ffffff", textAlign: "left", lineHeight: 1.4,
        textShadow: SHADOW_SM },
      // "1st" — anniversary badge
      { type: "text", x: 60, y: 55, width: 35, height: 8, rotation: 0, zIndex: 10, opacity: 1,
        content: "1st", fontFamily: "Great Vibes", fontSize: 6, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", lineHeight: 1,
        textShadow: SHADOW },
      // "ANNIVERSARY"
      { type: "text", x: 60, y: 62, width: 35, height: 3.5, rotation: 0, zIndex: 10, opacity: 1,
        content: "ANNIVERSARY", fontFamily: "Montserrat", fontSize: 1.8, fontWeight: "600",
        textColor: "#ffffff", textAlign: "center", letterSpacing: 0.25, textTransform: "uppercase",
        textShadow: SHADOW_SM },
      // "Love Edition"
      { type: "text", x: 60, y: 65.5, width: 35, height: 4, rotation: 0, zIndex: 10, opacity: 1,
        content: "Love Edition", fontFamily: "Great Vibes", fontSize: 3, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", textShadow: SHADOW_SM },
      // ── White bottom bar ──
      { type: "shape", x: 0, y: 85, width: 100, height: 15, rotation: 0, zIndex: 5, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      // "FEATURING CUTEST COUPLE"
      { type: "text", x: 3, y: 86, width: 55, height: 3, rotation: 0, zIndex: 10, opacity: 0.5,
        content: "FEATURING CUTEST COUPLE", fontFamily: "Montserrat", fontSize: 1.1, fontWeight: "500",
        textColor: "#333333", textAlign: "left", letterSpacing: 0.2, textTransform: "uppercase" },
      // Couple names
      { type: "text", x: 3, y: 89, width: 55, height: 9, rotation: 0, zIndex: 10, opacity: 1,
        content: "OLIVIA &\nBEN", fontFamily: "Bodoni Moda", fontSize: 5, fontWeight: "700",
        textColor: "#111111", textAlign: "left", lineHeight: 1 },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 6 — About Me (Lifestyle)
   Full-bleed portrait + large script + badge
   ═══════════════════════════════════════════════════════════════ */
const aboutMe: MagazineTemplateDef = {
  id: "mag-about-me",
  name: "About Me",
  category: "magazine",
  photo_count: 1,
  previewAccent: "#e9c46a",
  config: {
    mode: "freeform",
    backgroundGradient: "linear-gradient(160deg, #e0c9a6 0%, #d4a276 50%, #b08968 100%)",
    backgroundColor: "#d4a276",
    elements: [
      // Full-bleed portrait photo
      { type: "image", x: 0, y: 0, width: 100, height: 100, rotation: 0, zIndex: 1, opacity: 1,
        objectFit: "cover", imageUrl: PH("1534528741775-53994a69daeb") },
      // Left-top gradient overlay for script text
      { type: "shape", x: 0, y: 0, width: 60, height: 50, rotation: 0, zIndex: 2, opacity: 0.3,
        shapeType: "rectangle", fillColor: "#1a1a1a" },
      // "About" — large script
      { type: "text", x: 6, y: 8, width: 55, height: 18, rotation: 0, zIndex: 10, opacity: 1,
        content: "About", fontFamily: "Great Vibes", fontSize: 14, fontWeight: "400",
        textColor: "#ffffff", textAlign: "left", lineHeight: 0.8,
        textShadow: "2px 4px 15px rgba(0,0,0,0.5)" },
      // "Me" — large script
      { type: "text", x: 26, y: 24, width: 45, height: 16, rotation: 0, zIndex: 10, opacity: 1,
        content: "Me", fontFamily: "Great Vibes", fontSize: 14, fontWeight: "400",
        textColor: "#ffffff", textAlign: "left", lineHeight: 0.8,
        textShadow: "2px 4px 15px rgba(0,0,0,0.5)" },
      // "Top 8 Highlights" circle badge
      { type: "shape", x: 66, y: 62, width: 22, height: 14, rotation: 0, zIndex: 8, opacity: 0.85,
        shapeType: "circle", fillColor: "rgba(255,255,255,0.15)", strokeColor: "#ffffff", strokeWidth: 2 },
      { type: "text", x: 66, y: 64, width: 22, height: 5, rotation: 0, zIndex: 10, opacity: 1,
        content: "Top 8", fontFamily: "Montserrat", fontSize: 2.2, fontWeight: "700",
        textColor: "#ffffff", textAlign: "center", lineHeight: 1,
        textShadow: SHADOW_SM },
      { type: "text", x: 66, y: 69, width: 22, height: 4, rotation: 0, zIndex: 10, opacity: 0.85,
        content: "Highlights", fontFamily: "Montserrat", fontSize: 1.5, fontWeight: "400",
        textColor: "#ffffff", textAlign: "center", lineHeight: 1,
        textShadow: SHADOW_SM },
      // Social handle
      { type: "text", x: 3, y: 93, width: 40, height: 3.5, rotation: 0, zIndex: 10, opacity: 0.7,
        content: "@votrecompte", fontFamily: "Montserrat", fontSize: 1.5, fontWeight: "400",
        textColor: "#ffffff", textAlign: "left", lineHeight: 1,
        textShadow: SHADOW_SM },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 7 — Happy Birthday (Party Fun)
   Warm beige BG + 6 polaroid photos + bold colourful title
   ═══════════════════════════════════════════════════════════════ */
const happyBirthdayParty: MagazineTemplateDef = {
  id: "mag-birthday-party",
  name: "Happy Birthday Fun",
  category: "bebe",
  photo_count: 6,
  previewAccent: "#e07a5f",
  config: {
    mode: "freeform",
    backgroundColor: "#f5e8d8",
    elements: [
      // "HAPPY" title (coral accent)
      { type: "text", x: 10, y: 3, width: 80, height: 8, rotation: 0, zIndex: 10, opacity: 1,
        content: "HAPPY", fontFamily: "Oswald", fontSize: 7, fontWeight: "700",
        textColor: "#e07a5f", textAlign: "center", letterSpacing: 0.08, lineHeight: 1 },
      // "BIRTHDAY" title (dark)
      { type: "text", x: 5, y: 10, width: 90, height: 8, rotation: 0, zIndex: 10, opacity: 1,
        content: "BIRTHDAY", fontFamily: "Oswald", fontSize: 7, fontWeight: "700",
        textColor: "#3d2a1a", textAlign: "center", letterSpacing: 0.08, lineHeight: 1 },
      // Subtitle
      { type: "text", x: 20, y: 18, width: 60, height: 3, rotation: 0, zIndex: 10, opacity: 0.6,
        content: "Chaque instant est un cadeau", fontFamily: "Montserrat", fontSize: 1.4, fontWeight: "400",
        textColor: "#5a4a3a", textAlign: "center", letterSpacing: 0.1, lineHeight: 1 },
      // ── Row 1: 3 polaroid photos ──
      { type: "shape", x: 2, y: 22, width: 28, height: 24, rotation: -4, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff", strokeColor: "#e8e0d5", strokeWidth: 1 },
      { type: "image", x: 3.5, y: 23, width: 25, height: 18, rotation: -4, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1530103862676-de8c9debad1d", 500, 400) },
      { type: "shape", x: 36, y: 21, width: 28, height: 24, rotation: 2, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff", strokeColor: "#e8e0d5", strokeWidth: 1 },
      { type: "image", x: 37.5, y: 22, width: 25, height: 18, rotation: 2, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1558636508-e0db3814bd1d", 500, 400) },
      { type: "shape", x: 68, y: 22, width: 28, height: 24, rotation: 5, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff", strokeColor: "#e8e0d5", strokeWidth: 1 },
      { type: "image", x: 69.5, y: 23, width: 25, height: 18, rotation: 5, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1513151233558-d860c5398776", 500, 400) },
      // ── Row 2: 3 polaroid photos ──
      { type: "shape", x: 4, y: 52, width: 28, height: 24, rotation: 5, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff", strokeColor: "#e8e0d5", strokeWidth: 1 },
      { type: "image", x: 5.5, y: 53, width: 25, height: 18, rotation: 5, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1544126592-807ade215a0b", 500, 400) },
      { type: "shape", x: 36, y: 50, width: 28, height: 24, rotation: -3, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff", strokeColor: "#e8e0d5", strokeWidth: 1 },
      { type: "image", x: 37.5, y: 51, width: 25, height: 18, rotation: -3, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1519689680058-324335c77eba", 500, 400) },
      { type: "shape", x: 67, y: 52, width: 28, height: 24, rotation: -5, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff", strokeColor: "#e8e0d5", strokeWidth: 1 },
      { type: "image", x: 68.5, y: 53, width: 25, height: 18, rotation: -5, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1566004100477-7b105dce6024", 500, 400) },
      // Footer
      { type: "text", x: 15, y: 82, width: 70, height: 5, rotation: 0, zIndex: 10, opacity: 1,
        content: "Joyeux Anniversaire !", fontFamily: "Great Vibes", fontSize: 4.5, fontWeight: "400",
        textColor: "#e07a5f", textAlign: "center", lineHeight: 1 },
      // Confetti decorations
      { type: "text", x: 5, y: 1, width: 5, height: 4, rotation: 15, zIndex: 10, opacity: 0.5,
        content: "🎉", fontFamily: "Montserrat", fontSize: 3, textColor: "#000000" },
      { type: "text", x: 90, y: 2, width: 5, height: 4, rotation: -15, zIndex: 10, opacity: 0.5,
        content: "🎈", fontFamily: "Montserrat", fontSize: 3, textColor: "#000000" },
      { type: "text", x: 3, y: 88, width: 5, height: 4, rotation: -10, zIndex: 10, opacity: 0.5,
        content: "✨", fontFamily: "Montserrat", fontSize: 3, textColor: "#000000" },
      { type: "text", x: 92, y: 85, width: 5, height: 4, rotation: 10, zIndex: 10, opacity: 0.5,
        content: "🎂", fontFamily: "Montserrat", fontSize: 3, textColor: "#000000" },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 8 — Happy Birthday (Baby Minimal)
   Cream BG + 3 tilted polaroids + script text
   ═══════════════════════════════════════════════════════════════ */
const happyBirthdayBaby: MagazineTemplateDef = {
  id: "mag-birthday-baby",
  name: "Happy Birthday Baby",
  category: "bebe",
  photo_count: 3,
  previewAccent: "#c9a87c",
  config: {
    mode: "freeform",
    backgroundColor: "#f9f3ec",
    elements: [
      // Polaroid 1 (top-left, tilted)
      { type: "shape", x: 6, y: 5, width: 40, height: 32, rotation: -8, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      { type: "image", x: 8, y: 6.5, width: 36, height: 26, rotation: -8, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1519689680058-324335c77eba", 600, 450) },
      // Polaroid 2 (right, tilted other way)
      { type: "shape", x: 44, y: 15, width: 40, height: 32, rotation: 6, zIndex: 4, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      { type: "image", x: 46, y: 16.5, width: 36, height: 26, rotation: 6, zIndex: 5, opacity: 1,
        objectFit: "cover", imageUrl: PH("1544126592-807ade215a0b", 600, 450) },
      // Polaroid 3 (center-bottom, larger)
      { type: "shape", x: 18, y: 48, width: 48, height: 36, rotation: -3, zIndex: 6, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      { type: "image", x: 20.5, y: 50, width: 43, height: 28, rotation: -3, zIndex: 7, opacity: 1,
        objectFit: "cover", imageUrl: PH("1566004100477-7b105dce6024", 700, 500) },
      // "Happy" script
      { type: "text", x: 52, y: 2, width: 42, height: 10, rotation: 0, zIndex: 10, opacity: 1,
        content: "Happy", fontFamily: "Great Vibes", fontSize: 6.5, fontWeight: "400",
        textColor: "#c9a87c", textAlign: "center", lineHeight: 1 },
      // "Birthday" script
      { type: "text", x: 52, y: 10, width: 42, height: 8, rotation: 0, zIndex: 10, opacity: 1,
        content: "Birthday", fontFamily: "Great Vibes", fontSize: 5.5, fontWeight: "400",
        textColor: "#5a4a3a", textAlign: "center", lineHeight: 1 },
      // Star decorations
      { type: "text", x: 14, y: 42, width: 5, height: 4, rotation: 15, zIndex: 10, opacity: 0.35,
        content: "✦", fontFamily: "Montserrat", fontSize: 3, textColor: "#c9a87c" },
      { type: "text", x: 22, y: 44, width: 4, height: 3, rotation: -10, zIndex: 10, opacity: 0.25,
        content: "☆", fontFamily: "Montserrat", fontSize: 2, textColor: "#c9a87c" },
      // Heart
      { type: "text", x: 68, y: 86, width: 10, height: 7, rotation: 0, zIndex: 10, opacity: 0.25,
        content: "♡", fontFamily: "Montserrat", fontSize: 5, textColor: "#c9a87c" },
      // Name placeholder
      { type: "text", x: 20, y: 88, width: 44, height: 5, rotation: 0, zIndex: 10, opacity: 0.7,
        content: "Petit Trésor", fontFamily: "Great Vibes", fontSize: 4, fontWeight: "400",
        textColor: "#5a4a3a", textAlign: "center", lineHeight: 1 },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   TEMPLATE 9 — My Family (Scrapbook)
   Textured BG + scattered photos with white frames + script text
   ═══════════════════════════════════════════════════════════════ */
const myFamily: MagazineTemplateDef = {
  id: "mag-my-family",
  name: "My Family",
  category: "famille",
  photo_count: 5,
  previewAccent: "#7c6f5b",
  config: {
    mode: "freeform",
    backgroundColor: "#ede4d8",
    elements: [
      // Subtle texture band
      { type: "shape", x: 28, y: 0, width: 16, height: 100, rotation: 0, zIndex: 0, opacity: 0.06,
        shapeType: "rectangle", fillColor: "#8dbcc4" },
      // Photo 1 — top left (tilted, white frame)
      { type: "shape", x: 4, y: 4, width: 36, height: 26, rotation: -5, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      { type: "image", x: 6, y: 5.5, width: 32, height: 21, rotation: -5, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1511895426328-dc8714191300", 600, 400) },
      // Photo 2 — top right (tilted)
      { type: "shape", x: 50, y: 3, width: 28, height: 20, rotation: 4, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      { type: "image", x: 52, y: 4.5, width: 24, height: 15, rotation: 4, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1609220136736-443140cffec6", 600, 400) },
      // Photo 3 — middle right (overlapping)
      { type: "shape", x: 52, y: 24, width: 32, height: 24, rotation: 2, zIndex: 4, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      { type: "image", x: 54, y: 25.5, width: 28, height: 19, rotation: 2, zIndex: 5, opacity: 1,
        objectFit: "cover", imageUrl: PH("1581952976147-5a2d15560349", 600, 400) },
      // Photo 4 — bottom left
      { type: "shape", x: 2, y: 56, width: 34, height: 24, rotation: -3, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      { type: "image", x: 4, y: 57.5, width: 30, height: 19, rotation: -3, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1475688621402-4257c812d6db", 600, 400) },
      // Photo 5 — bottom right
      { type: "shape", x: 50, y: 56, width: 34, height: 24, rotation: 5, zIndex: 2, opacity: 1,
        shapeType: "rectangle", fillColor: "#ffffff" },
      { type: "image", x: 52, y: 57.5, width: 30, height: 19, rotation: 5, zIndex: 3, opacity: 1,
        objectFit: "cover", imageUrl: PH("1596464716127-f2a6f065aa1e", 600, 400) },
      // "My Family" — script text
      { type: "text", x: 4, y: 35, width: 44, height: 14, rotation: 0, zIndex: 10, opacity: 1,
        content: "My\nFamily", fontFamily: "Great Vibes", fontSize: 7.5, fontWeight: "400",
        textColor: "#5a4a38", textAlign: "left", lineHeight: 1 },
      // "Family is Everything" banner
      { type: "shape", x: 46, y: 48, width: 40, height: 5, rotation: -1, zIndex: 8, opacity: 0.85,
        shapeType: "rectangle", fillColor: "#e8ddd0" },
      { type: "text", x: 46, y: 48.5, width: 40, height: 4, rotation: -1, zIndex: 10, opacity: 1,
        content: "Family is Everything", fontFamily: "Montserrat", fontSize: 1.6, fontWeight: "500",
        textColor: "#6d5c4a", textAlign: "center", letterSpacing: 0.08, lineHeight: 1 },
      // Small heart decoration
      { type: "text", x: 40, y: 35, width: 6, height: 5, rotation: 10, zIndex: 10, opacity: 0.2,
        content: "❤", fontFamily: "Montserrat", fontSize: 4, textColor: "#c9a87c" },
    ] as Omit<FreeformElement, "id">[],
  },
};

/* ═══════════════════════════════════════════════════════════════
   ALL MAGAZINE TEMPLATES
   ═══════════════════════════════════════════════════════════════ */
export const MAGAZINE_TEMPLATES: MagazineTemplateDef[] = [
  numeraFashion,
  togetherCouple,
  coupleWedding,
  aboutMe,
  hendersonFamily,
  loveInFrames,
  myFamily,
  happyBirthdayParty,
  happyBirthdayBaby,
];

/** Lookup a template by id */
export function getMagazineTemplate(id: string): MagazineTemplateDef | undefined {
  return MAGAZINE_TEMPLATES.find((t) => t.id === id);
}

/** Convert magazine templates to LayoutTemplate[] for sidebar display */
export function getMagazineLayoutTemplates(): LayoutTemplate[] {
  return MAGAZINE_TEMPLATES.map((t, i) => ({
    id: t.id,
    name: t.name,
    photo_count: t.photo_count,
    grid_config: t.config,
    category: t.category,
    display_order: 9000 + i,
  }));
}
