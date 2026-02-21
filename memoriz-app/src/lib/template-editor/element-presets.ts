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
