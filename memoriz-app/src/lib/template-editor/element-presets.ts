/* ─────────────────────────────────────────────────────────────
   Element presets — shapes, icons, frames
   ───────────────────────────────────────────────────────────── */

import * as fabric from "fabric";

/* ══════════════ SHAPES ══════════════ */

export type ShapePreset = {
  id: string;
  name: string;
  icon: string;
  create: (canvas: fabric.Canvas) => fabric.FabricObject;
};

export const SHAPE_PRESETS: ShapePreset[] = [
  {
    id: "rectangle",
    name: "Rectangle",
    icon: "□",
    create: (canvas) =>
      new fabric.Rect({
        left: canvas.getWidth() / 2 - 75,
        top: canvas.getHeight() / 2 - 50,
        width: 150,
        height: 100,
        fill: "#7c3aed",
        rx: 0,
        ry: 0,
        name: "Rectangle",
      }),
  },
  {
    id: "rounded-rect",
    name: "Rectangle arrondi",
    icon: "▢",
    create: (canvas) =>
      new fabric.Rect({
        left: canvas.getWidth() / 2 - 75,
        top: canvas.getHeight() / 2 - 50,
        width: 150,
        height: 100,
        fill: "#3b82f6",
        rx: 16,
        ry: 16,
        name: "Rect arrondi",
      }),
  },
  {
    id: "circle",
    name: "Cercle",
    icon: "○",
    create: (canvas) =>
      new fabric.Circle({
        left: canvas.getWidth() / 2 - 50,
        top: canvas.getHeight() / 2 - 50,
        radius: 50,
        fill: "#ec4899",
        name: "Cercle",
      }),
  },
  {
    id: "ellipse",
    name: "Ellipse",
    icon: "⬮",
    create: (canvas) =>
      new fabric.Ellipse({
        left: canvas.getWidth() / 2 - 75,
        top: canvas.getHeight() / 2 - 40,
        rx: 75,
        ry: 40,
        fill: "#f59e0b",
        name: "Ellipse",
      }),
  },
  {
    id: "triangle",
    name: "Triangle",
    icon: "△",
    create: (canvas) =>
      new fabric.Triangle({
        left: canvas.getWidth() / 2 - 50,
        top: canvas.getHeight() / 2 - 50,
        width: 100,
        height: 100,
        fill: "#10b981",
        name: "Triangle",
      }),
  },
  {
    id: "line",
    name: "Ligne",
    icon: "─",
    create: (canvas) =>
      new fabric.Line(
        [
          canvas.getWidth() / 2 - 75,
          canvas.getHeight() / 2,
          canvas.getWidth() / 2 + 75,
          canvas.getHeight() / 2,
        ],
        {
          stroke: "#111827",
          strokeWidth: 3,
          name: "Ligne",
        }
      ),
  },
  {
    id: "dashed-line",
    name: "Ligne pointillée",
    icon: "┄",
    create: (canvas) =>
      new fabric.Line(
        [
          canvas.getWidth() / 2 - 75,
          canvas.getHeight() / 2,
          canvas.getWidth() / 2 + 75,
          canvas.getHeight() / 2,
        ],
        {
          stroke: "#6b7280",
          strokeWidth: 2,
          strokeDashArray: [8, 6],
          name: "Ligne pointillée",
        }
      ),
  },
  {
    id: "star",
    name: "Étoile",
    icon: "★",
    create: (canvas) => {
      const points = createStarPoints(5, 50, 25);
      return new fabric.Polygon(points, {
        left: canvas.getWidth() / 2 - 50,
        top: canvas.getHeight() / 2 - 50,
        fill: "#eab308",
        name: "Étoile",
      });
    },
  },
  {
    id: "diamond",
    name: "Losange",
    icon: "◇",
    create: (canvas) =>
      new fabric.Polygon(
        [
          { x: 50, y: 0 },
          { x: 100, y: 60 },
          { x: 50, y: 120 },
          { x: 0, y: 60 },
        ],
        {
          left: canvas.getWidth() / 2 - 50,
          top: canvas.getHeight() / 2 - 60,
          fill: "#8b5cf6",
          name: "Losange",
        }
      ),
  },
  {
    id: "arrow-right",
    name: "Flèche droite",
    icon: "→",
    create: (canvas) =>
      new fabric.Polygon(
        [
          { x: 0, y: 20 },
          { x: 80, y: 20 },
          { x: 80, y: 0 },
          { x: 120, y: 35 },
          { x: 80, y: 70 },
          { x: 80, y: 50 },
          { x: 0, y: 50 },
        ],
        {
          left: canvas.getWidth() / 2 - 60,
          top: canvas.getHeight() / 2 - 35,
          fill: "#ef4444",
          name: "Flèche",
        }
      ),
  },
  {
    id: "hexagon",
    name: "Hexagone",
    icon: "⬡",
    create: (canvas) => {
      const points = createRegularPolygon(6, 50);
      return new fabric.Polygon(points, {
        left: canvas.getWidth() / 2 - 50,
        top: canvas.getHeight() / 2 - 50,
        fill: "#06b6d4",
        name: "Hexagone",
      });
    },
  },
  {
    id: "pentagon",
    name: "Pentagone",
    icon: "⬠",
    create: (canvas) => {
      const points = createRegularPolygon(5, 50);
      return new fabric.Polygon(points, {
        left: canvas.getWidth() / 2 - 50,
        top: canvas.getHeight() / 2 - 50,
        fill: "#14b8a6",
        name: "Pentagone",
      });
    },
  },
];

/* ══════════════ HELPER FUNCTIONS ══════════════ */

function createStarPoints(
  spikes: number,
  outerRadius: number,
  innerRadius: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  const step = Math.PI / spikes;

  for (let i = 0; i < 2 * spikes; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = i * step - Math.PI / 2;
    points.push({
      x: outerRadius + Math.cos(angle) * radius,
      y: outerRadius + Math.sin(angle) * radius,
    });
  }
  return points;
}

function createRegularPolygon(
  sides: number,
  radius: number
): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
    points.push({
      x: radius + Math.cos(angle) * radius,
      y: radius + Math.sin(angle) * radius,
    });
  }
  return points;
}

/* ══════════════ TEXT PRESETS ══════════════ */

export type TextPreset = {
  id: string;
  name: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  fill: string;
};

export const TEXT_PRESETS: TextPreset[] = [
  {
    id: "title",
    name: "Titre",
    fontSize: 48,
    fontFamily: "Playfair Display",
    fontWeight: "bold",
    fontStyle: "normal",
    fill: "#111827",
  },
  {
    id: "subtitle",
    name: "Sous-titre",
    fontSize: 28,
    fontFamily: "Montserrat",
    fontWeight: "600",
    fontStyle: "normal",
    fill: "#374151",
  },
  {
    id: "body",
    name: "Paragraphe",
    fontSize: 16,
    fontFamily: "Poppins",
    fontWeight: "normal",
    fontStyle: "normal",
    fill: "#4b5563",
  },
  {
    id: "caption",
    name: "Légende",
    fontSize: 12,
    fontFamily: "Montserrat",
    fontWeight: "300",
    fontStyle: "italic",
    fill: "#6b7280",
  },
  {
    id: "display",
    name: "Display",
    fontSize: 72,
    fontFamily: "Bodoni Moda",
    fontWeight: "900",
    fontStyle: "normal",
    fill: "#111827",
  },
  {
    id: "script",
    name: "Script",
    fontSize: 36,
    fontFamily: "Great Vibes",
    fontWeight: "normal",
    fontStyle: "normal",
    fill: "#7c3aed",
  },
];

/** Create a Fabric Textbox from a preset */
export function createTextFromPreset(
  canvas: fabric.Canvas,
  preset: TextPreset
): fabric.Textbox {
  return new fabric.Textbox(preset.name === "Titre" ? "Votre Titre" : preset.name === "Sous-titre" ? "Sous-titre ici" : preset.name === "Paragraphe" ? "Ajoutez votre texte ici. Double-cliquez pour éditer." : preset.name === "Display" ? "DISPLAY" : preset.name === "Script" ? "Élégant" : "Légende photo", {
    left: canvas.getWidth() / 2 - 100,
    top: canvas.getHeight() / 2 - preset.fontSize / 2,
    width: 200,
    fontSize: preset.fontSize,
    fontFamily: preset.fontFamily,
    fontWeight: preset.fontWeight,
    fontStyle: preset.fontStyle as "" | "normal" | "italic" | "oblique",
    fill: preset.fill,
    textAlign: "center",
    name: preset.name,
    editable: true,
  });
}

/* ══════════════ FRAME PRESETS (decorative borders) ══════════════ */

export type FramePreset = {
  id: string;
  name: string;
  icon: string;
  borderWidth: number;
  borderColor: string;
  borderRadius: number;
  padding: number;
};

export const FRAME_PRESETS: FramePreset[] = [
  { id: "thin-black", name: "Fin noir", icon: "▫", borderWidth: 2, borderColor: "#000000", borderRadius: 0, padding: 10 },
  { id: "thick-black", name: "Épais noir", icon: "▪", borderWidth: 6, borderColor: "#000000", borderRadius: 0, padding: 12 },
  { id: "thin-gold", name: "Fin doré", icon: "◻", borderWidth: 2, borderColor: "#d4a574", borderRadius: 0, padding: 10 },
  { id: "rounded-thin", name: "Arrondi fin", icon: "◯", borderWidth: 2, borderColor: "#000000", borderRadius: 12, padding: 10 },
  { id: "rounded-thick", name: "Arrondi épais", icon: "⬭", borderWidth: 5, borderColor: "#7c3aed", borderRadius: 16, padding: 12 },
  { id: "double", name: "Double", icon: "◻◻", borderWidth: 3, borderColor: "#111827", borderRadius: 0, padding: 16 },
];

/** Create a decorative frame (Rect with stroke, no fill) */
export function createFrame(
  canvas: fabric.Canvas,
  preset: FramePreset
): fabric.Rect {
  return new fabric.Rect({
    left: canvas.getWidth() / 2 - 100,
    top: canvas.getHeight() / 2 - 75,
    width: 200,
    height: 150,
    fill: "transparent",
    stroke: preset.borderColor,
    strokeWidth: preset.borderWidth,
    rx: preset.borderRadius,
    ry: preset.borderRadius,
    name: `Cadre ${preset.name}`,
  });
}

/* ══════════════ IMAGE CLIP FRAMES (Canva-style placeholders) ══════════════ */

export type ClipFrameCategory =
  | "Formes de base"
  | "Appareils"
  | "Blob"
  | "Lettres"
  | "Chiffres"
  | "Tendances";

export type ClipFramePreset = {
  id: string;
  category: ClipFrameCategory;
  name: string;
  svgPath: string; // The path data or special instruction
  viewBox?: string; // e.g. "0 0 100 100"
};

export const CLIP_FRAME_PRESETS: ClipFramePreset[] = [
  // --- Formes de base ---
  {
    id: "clip-rect",
    category: "Formes de base",
    name: "Rectangle",
    viewBox: "0 0 100 100",
    svgPath: "M0,0 h100 v100 h-100 z",
  },
  {
    id: "clip-circle",
    category: "Formes de base",
    name: "Cercle",
    viewBox: "0 0 100 100",
    svgPath: "M50,0 A50,50 0 1,1 50.1,0 Z", // Simplified circle path
  },
  {
    id: "clip-arch",
    category: "Formes de base",
    name: "Arche",
    viewBox: "0 0 100 120",
    svgPath: "M0,50 A50,50 0 0,1 100,50 v70 h-100 z",
  },
  {
    id: "clip-triangle",
    category: "Formes de base",
    name: "Triangle",
    viewBox: "0 0 100 100",
    svgPath: "M50,0 L100,100 L0,100 Z",
  },

  // --- Blob ---
  {
    id: "clip-blob-1",
    category: "Blob",
    name: "Blob Souple",
    viewBox: "0 0 200 200",
    svgPath: "M104.9,-138.8C134.4,-112.5,155.9,-75.8,166,-36.8C176.1,2.1,174.9,43.3,158.4,79C141.9,114.7,110.3,144.8,72.7,163.7C35.1,182.5,-8.5,190,-46.8,178.6C-85.1,167.3,-118.2,137.1,-142.2,99.9C-166.1,62.7,-181,18.5,-175.7,-23.4C-170.3,-65.2,-144.9,-104.7,-110.1,-130.4C-75.3,-156.1,-31.2,-168,7.9,-177.3C46.9,-186.6,90.4,-193.3,104.9,-138.8Z",
  },
  {
    id: "clip-blob-2",
    category: "Blob",
    name: "Blob Organique",
    viewBox: "0 0 200 200",
    svgPath: "M149.2,-175.1C188.4,-133.4,212,-73.4,208.6,-15.8C205.1,41.9,174.6,97,133.2,137.3C91.9,177.6,39.6,203.1,-11.5,216.7C-62.6,230.3,-112.4,232.1,-154.2,204.6C-196,177.2,-229.7,120.4,-235.8,62.7C-241.9,5,-220.5,-53.7,-183.7,-100.3C-146.9,-147,-94.7,-181.6,-38.3,-187C18.2,-192.4,59.9,-189.6,149.2,-175.1Z",
  },

  // --- Tendances ---
  {
    id: "clip-trend-heart",
    category: "Tendances",
    name: "Cœur",
    viewBox: "0 0 100 100",
    svgPath: "M50,88 C50,88 0,55 0,30 C0,13 13,0 30,0 C40,0 50,10 50,10 C50,10 60,0 70,0 C87,0 100,13 100,30 C100,55 50,88 50,88 Z",
  },
  {
    id: "clip-trend-star",
    category: "Tendances",
    name: "Étoile",
    viewBox: "0 0 100 100",
    svgPath: "M50,0 L61,35 L98,35 L68,57 L79,91 L50,70 L21,91 L32,57 L2,35 L39,35 Z",
  },
  {
    id: "clip-trend-diamond",
    category: "Tendances",
    name: "Losange",
    viewBox: "0 0 100 100",
    svgPath: "M50,0 L100,50 L50,100 L0,50 Z",
  },
  {
    id: "clip-trend-badge",
    category: "Tendances",
    name: "Écusson",
    viewBox: "0 0 100 100",
    svgPath: "M 50 0 L 85 15 L 85 55 C 85 75 65 95 50 100 C 35 95 15 75 15 55 L 15 15 Z",
  },

  // --- Appareils ---
  {
    id: "clip-phone",
    category: "Appareils",
    name: "Téléphone",
    viewBox: "0 0 100 200",
    svgPath: "M15,0 h70 a15,15 0 0,1 15,15 v170 a15,15 0 0,1 -15,15 h-70 a15,15 0 0,1 -15,-15 v-170 a15,15 0 0,1 15,-15 z M5,20 h90 v160 h-90 z",
    // To make it simple, we just use a rounded rect as the image mask, and we could draw the frame on top.
    // For simplicity right now, the clip mask is the exact shape.
  },
  {
    id: "clip-laptop",
    category: "Appareils",
    name: "Ordinateur",
    viewBox: "0 0 200 150",
    svgPath: "M20,10 h160 a10,10 0 0,1 10,10 v100 a10,10 0 0,1 -10,10 h-160 a10,10 0 0,1 -10,-10 v-100 a10,10 0 0,1 10,-10 z M5,130 h190 v10 a10,10 0 0,1 -10,10 h-170 a10,10 0 0,1 -10,-10 z M25,15 h150 v95 h-150 z",
  },

  // --- Lettres ---
  {
    id: "clip-letter-A",
    category: "Lettres",
    name: "Lettre A",
    viewBox: "0 0 100 100",
    svgPath: "M20,100 L45,20 H55 L80,100 H65 L58,75 H42 L35,100 Z M46,60 H54 L50,45 Z",
  },
  {
    id: "clip-letter-B",
    category: "Lettres",
    name: "Lettre B",
    viewBox: "0 0 100 100",
    svgPath: "M20,20 H60 C75,20 85,25 85,40 C85,50 78,55 70,58 C82,60 90,68 90,80 C90,95 78,100 60,100 H20 Z M40,35 V55 H58 C65,55 68,52 68,45 C68,38 65,35 58,35 Z M40,70 V85 H60 C68,85 72,82 72,77 C72,72 68,70 60,70 Z",
  },
  {
    id: "clip-letter-C",
    category: "Lettres",
    name: "Lettre C",
    viewBox: "0 0 100 100",
    svgPath: "M80,30 C75,22 65,15 50,15 C30,15 15,35 15,60 C15,85 30,105 50,105 C65,105 75,98 80,90 L65,75 C62,80 58,85 50,85 C38,85 35,70 35,60 C35,50 38,35 50,35 C58,35 62,40 65,45 Z",
  },

  // --- Chiffres ---
  {
    id: "clip-num-1",
    category: "Chiffres",
    name: "Chiffre 1",
    viewBox: "0 0 100 100",
    svgPath: "M30,40 L50,20 H70 V100 H50 V40 L40,50 Z",
  },
  {
    id: "clip-num-2",
    category: "Chiffres",
    name: "Chiffre 2",
    viewBox: "0 0 100 100",
    svgPath: "M25,40 C25,25 40,15 55,15 C75,15 85,30 85,45 C85,60 65,70 45,85 H85 V100 H25 C25,80 65,65 65,45 C65,35 55,30 45,30 C35,30 35,40 35,40 Z",
  },
  {
    id: "clip-num-3",
    category: "Chiffres",
    name: "Chiffre 3",
    viewBox: "0 0 100 100",
    svgPath: "M25,25 H80 V40 L55,60 C70,60 85,70 85,85 C85,100 65,110 50,110 C35,110 25,100 20,90 L35,80 C38,88 45,92 50,92 C60,92 65,85 65,80 C65,75 55,70 45,70 H35 V55 H55 L70,40 H40 Z",
  }
];

/** Create a Fabric object ready to hold an image (mask) */
export function createClipFrame(
  canvas: fabric.Canvas,
  preset: ClipFramePreset
): fabric.FabricObject {
  // Use a Path object. We translate/scale it so it centers at origin (0,0) with a default size
  const pathObj = new fabric.Path(preset.svgPath, {
    fill: "#e5e7eb", // Light gray placeholder
    stroke: "#9ca3af",
    strokeWidth: 2,
    strokeDashArray: [5, 5], // Indicates it's an empty frame
    name: preset.name,
    objectCaching: false,
  });

  // Calculate generic bounding box and scale to a reasonable ~200px size
  const bbox = pathObj.getBoundingRect();
  const maxDim = Math.max(bbox.width, bbox.height);
  const scale = 200 / (maxDim || 200);

  pathObj.set({
    scaleX: scale,
    scaleY: scale,
    left: canvas.getWidth() / 2 - (bbox.width * scale) / 2,
    top: canvas.getHeight() / 2 - (bbox.height * scale) / 2,
  });

  // Tag it so our drop logic knows it's an image container
  (pathObj as any).isImageFrame = true;
  (pathObj as any).originalFrameId = preset.id;

  return pathObj;
}
