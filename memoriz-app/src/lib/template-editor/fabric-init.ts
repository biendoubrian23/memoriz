/* ─────────────────────────────────────────────────────────────
   Fabric.js initialisation & configuration
   ───────────────────────────────────────────────────────────── */

import * as fabric from "fabric";

/** Standard magazine page sizes (px at 72 DPI) */
export const PAGE_SIZES = {
  A4_PORTRAIT: { width: 595, height: 842, label: "A4 Portrait" },
  A4_LANDSCAPE: { width: 842, height: 595, label: "A4 Paysage" },
  SQUARE: { width: 700, height: 700, label: "Carré" },
  LETTER: { width: 612, height: 792, label: "Lettre US" },
  CUSTOM: { width: 700, height: 900, label: "Custom" },
} as const;

export type PageSizeKey = keyof typeof PAGE_SIZES;

/** Snap distance in px */
const SNAP_DISTANCE = 8;

/** Create & configure a Fabric canvas */
export function createFabricCanvas(
  canvasEl: HTMLCanvasElement,
  width: number,
  height: number
): fabric.Canvas {
  const canvas = new fabric.Canvas(canvasEl, {
    width,
    height,
    backgroundColor: "#ffffff",
    selection: true,
    preserveObjectStacking: true,
    controlsAboveOverlay: true,
    stopContextMenu: true,
    fireRightClick: true,
  });

  // Styling controls
  fabric.FabricObject.prototype.set({
    transparentCorners: false,
    cornerColor: "#7c3aed",
    cornerStrokeColor: "#7c3aed",
    cornerSize: 10,
    cornerStyle: "circle",
    borderColor: "#7c3aed",
    borderScaleFactor: 2,
    padding: 4,
  });

  return canvas;
}

/** Add snapping guidelines to canvas */
export function enableSnapping(canvas: fabric.Canvas) {
  const guidelines: fabric.Line[] = [];

  function clearGuidelines() {
    guidelines.forEach((line) => canvas.remove(line));
    guidelines.length = 0;
  }

  function addGuideline(x1: number, y1: number, x2: number, y2: number) {
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: "#7c3aed",
      strokeWidth: 1,
      strokeDashArray: [4, 4],
      selectable: false,
      evented: false,
      excludeFromExport: true,
    });
    canvas.add(line);
    guidelines.push(line);
  }

  canvas.on("object:moving", (e) => {
    const obj = e.target;
    if (!obj) return;
    clearGuidelines();

    const canvasW = canvas.getWidth();
    const canvasH = canvas.getHeight();

    const objLeft = obj.left ?? 0;
    const objTop = obj.top ?? 0;
    const objWidth = (obj.width ?? 0) * (obj.scaleX ?? 1);
    const objHeight = (obj.height ?? 0) * (obj.scaleY ?? 1);

    const centerX = objLeft + objWidth / 2;
    const centerY = objTop + objHeight / 2;
    const rightEdge = objLeft + objWidth;
    const bottomEdge = objTop + objHeight;

    // Snap to center
    if (Math.abs(centerX - canvasW / 2) < SNAP_DISTANCE) {
      obj.set({ left: canvasW / 2 - objWidth / 2 });
      addGuideline(canvasW / 2, 0, canvasW / 2, canvasH);
    }
    if (Math.abs(centerY - canvasH / 2) < SNAP_DISTANCE) {
      obj.set({ top: canvasH / 2 - objHeight / 2 });
      addGuideline(0, canvasH / 2, canvasW, canvasH / 2);
    }

    // Snap to edges
    if (Math.abs(objLeft) < SNAP_DISTANCE) {
      obj.set({ left: 0 });
      addGuideline(0, 0, 0, canvasH);
    }
    if (Math.abs(objTop) < SNAP_DISTANCE) {
      obj.set({ top: 0 });
      addGuideline(0, 0, canvasW, 0);
    }
    if (Math.abs(rightEdge - canvasW) < SNAP_DISTANCE) {
      obj.set({ left: canvasW - objWidth });
      addGuideline(canvasW, 0, canvasW, canvasH);
    }
    if (Math.abs(bottomEdge - canvasH) < SNAP_DISTANCE) {
      obj.set({ top: canvasH - objHeight });
      addGuideline(0, canvasH, canvasW, canvasH);
    }

    // Snap to other objects
    canvas.getObjects().forEach((other) => {
      if (other === obj || other.excludeFromExport) return;
      const oLeft = other.left ?? 0;
      const oTop = other.top ?? 0;
      const oW = (other.width ?? 0) * (other.scaleX ?? 1);
      const oH = (other.height ?? 0) * (other.scaleY ?? 1);
      const oCenter = { x: oLeft + oW / 2, y: oTop + oH / 2 };

      // Align left edges
      if (Math.abs(objLeft - oLeft) < SNAP_DISTANCE) {
        obj.set({ left: oLeft });
        addGuideline(oLeft, 0, oLeft, canvasH);
      }
      // Align right edges
      if (Math.abs(rightEdge - (oLeft + oW)) < SNAP_DISTANCE) {
        obj.set({ left: oLeft + oW - objWidth });
        addGuideline(oLeft + oW, 0, oLeft + oW, canvasH);
      }
      // Align centers X
      if (Math.abs(centerX - oCenter.x) < SNAP_DISTANCE) {
        obj.set({ left: oCenter.x - objWidth / 2 });
        addGuideline(oCenter.x, 0, oCenter.x, canvasH);
      }
      // Align top
      if (Math.abs(objTop - oTop) < SNAP_DISTANCE) {
        obj.set({ top: oTop });
        addGuideline(0, oTop, canvasW, oTop);
      }
      // Align bottom
      if (Math.abs(bottomEdge - (oTop + oH)) < SNAP_DISTANCE) {
        obj.set({ top: oTop + oH - objHeight });
        addGuideline(0, oTop + oH, canvasW, oTop + oH);
      }
      // Align centers Y
      if (Math.abs(centerY - oCenter.y) < SNAP_DISTANCE) {
        obj.set({ top: oCenter.y - objHeight / 2 });
        addGuideline(0, oCenter.y, canvasW, oCenter.y);
      }
    });

    canvas.requestRenderAll();
  });

  canvas.on("object:modified", () => clearGuidelines());
  canvas.on("mouse:up", () => clearGuidelines());

  return clearGuidelines;
}

/** Export canvas to data URL (for thumbnails) */
export function canvasToDataURL(
  canvas: fabric.Canvas,
  format: "png" | "jpeg" = "png",
  quality = 1,
  multiplier = 2
): string {
  return canvas.toDataURL({
    format,
    quality,
    multiplier,
  });
}

/** Serialize canvas to JSON */
export function canvasToJSON(canvas: fabric.Canvas): string {
  return JSON.stringify(canvas.toJSON());
}

/** Load canvas from JSON */
export async function canvasFromJSON(
  canvas: fabric.Canvas,
  json: string
): Promise<void> {
  await canvas.loadFromJSON(json);
  canvas.requestRenderAll();
}
