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

/** Snap distance in screen pixels (constant regardless of zoom) */
const SNAP_SCREEN_PX = 10;

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

  // Styling controls & Target finding
  fabric.FabricObject.prototype.set({
    transparentCorners: false,
    cornerColor: "#7c3aed",
    cornerStrokeColor: "#7c3aed",
    cornerSize: 10,
    cornerStyle: "circle",
    borderColor: "#7c3aed",
    borderScaleFactor: 2,
    padding: 4,
    perPixelTargetFind: true,
    targetFindTolerance: 4, // allow clicking within 4px of opaque pixels
  });

  // --- Canva-like Hover Borders ---
  let hoveredObject: fabric.FabricObject | null = null;

  canvas.on("mouse:over", (e) => {
    // Only highlight if not currently selected
    if (e.target && !canvas.getActiveObjects().includes(e.target)) {
      hoveredObject = e.target;
      canvas.requestRenderAll();
    }
  });

  canvas.on("mouse:out", (e) => {
    if (hoveredObject === e.target) {
      hoveredObject = null;
      canvas.requestRenderAll();
    }
  });

  // Clear hover when selection changes so we don't draw double borders
  const clearHover = () => {
    if (hoveredObject) {
      hoveredObject = null;
      canvas.requestRenderAll();
    }
  };
  canvas.on("selection:created", clearHover);
  canvas.on("selection:updated", clearHover);
  canvas.on("selection:cleared", clearHover);

  // Draw the border on top of everything
  canvas.on("after:render", (opt) => {
    const ctx = opt.ctx;
    if (hoveredObject && !canvas.getActiveObjects().includes(hoveredObject)) {
      ctx.save();
      const obj = hoveredObject;
      const m = obj.calcTransformMatrix();
      ctx.transform(m[0], m[1], m[2], m[3], m[4], m[5]);

      const w = obj.width ?? 0;
      const h = obj.height ?? 0;

      ctx.beginPath();
      ctx.rect(-w / 2, -h / 2, w, h);
      ctx.lineWidth = 1.5 / canvas.getZoom(); // Consistent thickness regardless of zoom
      ctx.strokeStyle = "#3b82f6"; // Tailwind blue-500
      ctx.stroke();
      ctx.restore();
    }
  });

  return canvas;
}

/** Add snapping guidelines to canvas.
 *  pageWidth / pageHeight = the logical page dimensions (e.g. 595×842 for A4).
 *  Snap distance is expressed in *screen* pixels and converted on the fly so
 *  the zone feels identical at every zoom level.
 */
export function enableSnapping(
  canvas: fabric.Canvas,
  pageWidth: number,
  pageHeight: number
) {
  const guidelines: fabric.Line[] = [];

  function clearGuidelines() {
    guidelines.forEach((line) => canvas.remove(line));
    guidelines.length = 0;
  }

  function addGuideline(x1: number, y1: number, x2: number, y2: number) {
    const z = canvas.getZoom();
    const line = new fabric.Line([x1, y1, x2, y2], {
      stroke: "#7c3aed",
      strokeWidth: 1 / z,             // stays 1 screen‑px at any zoom
      strokeDashArray: [4 / z, 4 / z],
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

    /* ── Zoom-aware snap distance (constant in screen px) ── */
    const zoom = canvas.getZoom();
    const snapDist = SNAP_SCREEN_PX / zoom;

    /* ── Page boundaries ── */
    const pw = pageWidth;
    const ph = pageHeight;

    /* ── Object bounds ── */
    const objLeft = obj.left ?? 0;
    const objTop = obj.top ?? 0;
    const objWidth = (obj.width ?? 0) * (obj.scaleX ?? 1);
    const objHeight = (obj.height ?? 0) * (obj.scaleY ?? 1);

    const centerX = objLeft + objWidth / 2;
    const centerY = objTop + objHeight / 2;
    const rightEdge = objLeft + objWidth;
    const bottomEdge = objTop + objHeight;

    /* ── Helper: snap only once per axis to avoid conflicts ── */
    let snappedX = false;
    let snappedY = false;

    /* ── Page edge snapping ── */

    // Left edge → page left (0)
    if (!snappedX && Math.abs(objLeft) < snapDist) {
      obj.set({ left: 0 });
      addGuideline(0, 0, 0, ph);
      snappedX = true;
    }
    // Right edge → page right
    if (!snappedX && Math.abs(rightEdge - pw) < snapDist) {
      obj.set({ left: pw - objWidth });
      addGuideline(pw, 0, pw, ph);
      snappedX = true;
    }
    // Center X → page center
    if (!snappedX && Math.abs(centerX - pw / 2) < snapDist) {
      obj.set({ left: pw / 2 - objWidth / 2 });
      addGuideline(pw / 2, 0, pw / 2, ph);
      snappedX = true;
    }

    // Top edge → page top (0)
    if (!snappedY && Math.abs(objTop) < snapDist) {
      obj.set({ top: 0 });
      addGuideline(0, 0, pw, 0);
      snappedY = true;
    }
    // Bottom edge → page bottom
    if (!snappedY && Math.abs(bottomEdge - ph) < snapDist) {
      obj.set({ top: ph - objHeight });
      addGuideline(0, ph, pw, ph);
      snappedY = true;
    }
    // Center Y → page center
    if (!snappedY && Math.abs(centerY - ph / 2) < snapDist) {
      obj.set({ top: ph / 2 - objHeight / 2 });
      addGuideline(0, ph / 2, pw, ph / 2);
      snappedY = true;
    }

    /* ── Snap to other objects ── */
    const others = canvas.getObjects().filter(
      (o) => o !== obj && !o.excludeFromExport
    );

    for (const other of others) {
      if (snappedX && snappedY) break;

      const oLeft = other.left ?? 0;
      const oTop = other.top ?? 0;
      const oW = (other.width ?? 0) * (other.scaleX ?? 1);
      const oH = (other.height ?? 0) * (other.scaleY ?? 1);
      const oCenterX = oLeft + oW / 2;
      const oCenterY = oTop + oH / 2;
      const oRight = oLeft + oW;
      const oBottom = oTop + oH;

      if (!snappedX) {
        // Left ↔ Left
        if (Math.abs(objLeft - oLeft) < snapDist) {
          obj.set({ left: oLeft });
          addGuideline(oLeft, 0, oLeft, ph);
          snappedX = true;
        }
        // Right ↔ Right
        else if (Math.abs(rightEdge - oRight) < snapDist) {
          obj.set({ left: oRight - objWidth });
          addGuideline(oRight, 0, oRight, ph);
          snappedX = true;
        }
        // Left ↔ Right (obj's left meets other's right)
        else if (Math.abs(objLeft - oRight) < snapDist) {
          obj.set({ left: oRight });
          addGuideline(oRight, 0, oRight, ph);
          snappedX = true;
        }
        // Right ↔ Left (obj's right meets other's left)
        else if (Math.abs(rightEdge - oLeft) < snapDist) {
          obj.set({ left: oLeft - objWidth });
          addGuideline(oLeft, 0, oLeft, ph);
          snappedX = true;
        }
        // Center ↔ Center X
        else if (Math.abs(centerX - oCenterX) < snapDist) {
          obj.set({ left: oCenterX - objWidth / 2 });
          addGuideline(oCenterX, 0, oCenterX, ph);
          snappedX = true;
        }
      }

      if (!snappedY) {
        // Top ↔ Top
        if (Math.abs(objTop - oTop) < snapDist) {
          obj.set({ top: oTop });
          addGuideline(0, oTop, pw, oTop);
          snappedY = true;
        }
        // Bottom ↔ Bottom
        else if (Math.abs(bottomEdge - oBottom) < snapDist) {
          obj.set({ top: oBottom - objHeight });
          addGuideline(0, oBottom, pw, oBottom);
          snappedY = true;
        }
        // Top ↔ Bottom (obj's top meets other's bottom)
        else if (Math.abs(objTop - oBottom) < snapDist) {
          obj.set({ top: oBottom });
          addGuideline(0, oBottom, pw, oBottom);
          snappedY = true;
        }
        // Bottom ↔ Top (obj's bottom meets other's top)
        else if (Math.abs(bottomEdge - oTop) < snapDist) {
          obj.set({ top: oTop - objHeight });
          addGuideline(0, oTop, pw, oTop);
          snappedY = true;
        }
        // Center ↔ Center Y
        else if (Math.abs(centerY - oCenterY) < snapDist) {
          obj.set({ top: oCenterY - objHeight / 2 });
          addGuideline(0, oCenterY, pw, oCenterY);
          snappedY = true;
        }
      }
    }

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
