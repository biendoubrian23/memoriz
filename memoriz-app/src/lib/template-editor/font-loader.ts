/* ─────────────────────────────────────────────────────────────
   Google Fonts dynamic loader
   ───────────────────────────────────────────────────────────── */

/** Most popular Google Fonts curated for magazine editing */
export const GOOGLE_FONTS = [
  // Serif
  "Playfair Display",
  "Bodoni Moda",
  "Cormorant Garamond",
  "DM Serif Display",
  "Libre Baskerville",
  "Lora",
  "Abril Fatface",
  "Italiana",
  "Merriweather",
  "Noto Serif",
  "PT Serif",
  "Source Serif 4",
  "Crimson Text",
  "EB Garamond",
  "Spectral",

  // Sans-Serif
  "Montserrat",
  "Poppins",
  "Raleway",
  "Oswald",
  "Inter",
  "Roboto",
  "Open Sans",
  "Nunito",
  "Work Sans",
  "Manrope",
  "DM Sans",
  "Space Grotesk",
  "Plus Jakarta Sans",
  "Outfit",
  "Lexend",
  "Figtree",
  "Archivo",
  "Barlow",
  "Rubik",
  "Josefin Sans",
  "Mulish",
  "Urbanist",

  // Display
  "Great Vibes",
  "Dancing Script",
  "Pacifico",
  "Caveat",
  "Lobster",
  "Righteous",
  "Bungee",
  "Bebas Neue",
  "Anton",
  "Black Ops One",
  "Russo One",
  "Teko",
  "Passion One",
  "Rampart One",

  // Monospace
  "JetBrains Mono",
  "Fira Code",
  "Source Code Pro",
  "IBM Plex Mono",
] as const;

export type GoogleFont = (typeof GOOGLE_FONTS)[number];

/** Already loaded fonts set */
const loadedFonts = new Set<string>();

/** Load a single Google Font with specific weights */
export async function loadFont(
  family: string,
  weights: number[] = [400, 700]
): Promise<void> {
  if (loadedFonts.has(family)) return;

  const weightsStr = weights.join(";");
  const familyStr = family.replace(/ /g, "+");
  const url = `https://fonts.googleapis.com/css2?family=${familyStr}:ital,wght@0,${weightsStr};1,${weightsStr}&display=swap`;

  // Create link element
  const link = document.createElement("link");
  link.href = url;
  link.rel = "stylesheet";
  document.head.appendChild(link);

  // Wait for font to actually load
  try {
    await document.fonts.load(`400 16px "${family}"`);
    loadedFonts.add(family);
  } catch {
    // Font may still load asynchronously, mark as loaded anyway
    loadedFonts.add(family);
  }
}

/** Load all popular fonts at once (call on editor mount) */
export async function loadAllFonts(): Promise<void> {
  const families = GOOGLE_FONTS.map(
    (f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700;800;900`
  ).join("&");
  const url = `https://fonts.googleapis.com/css2?${families}&display=swap`;

  const linkId = "memoriz-all-fonts";
  if (document.getElementById(linkId)) return;

  const link = document.createElement("link");
  link.id = linkId;
  link.href = url;
  link.rel = "stylesheet";
  document.head.appendChild(link);

  // Mark all as loaded
  GOOGLE_FONTS.forEach((f) => loadedFonts.add(f));
}

/** Check if a font is already loaded */
export function isFontLoaded(family: string): boolean {
  return loadedFonts.has(family);
}
