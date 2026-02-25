/* ─────────────────────────────────────────────────────────────
   grid-to-fabric — Convert a grid layout + placed photos/texts
   into Fabric.js canvas objects for the Canva-like editor.
   ───────────────────────────────────────────────────────────── */

import * as fabric from "fabric";
import type { GridCell, PageElement } from "@/lib/types/editor";

/**
 * Find the page element placed at a given grid cell position.
 * Uses a tight (< 0.5) threshold to avoid cross-cell matches.
 */
function findElementForCell(
  cell: GridCell,
  elements: PageElement[],
): PageElement | undefined {
  return elements.find(
    (el) =>
      Math.abs(el.position_x - cell.x) < 0.5 &&
      Math.abs(el.position_y - cell.y) < 0.5,
  );
}

/**
 * Add a light-gray placeholder rectangle for an empty image cell.
 */
function addPlaceholderRect(
  canvas: fabric.Canvas,
  left: number,
  top: number,
  width: number,
  height: number,
) {
  const rect = new fabric.Rect({
    left,
    top,
    width,
    height,
    fill: "transparent",
    stroke: "#d1d5db", // gray-300
    strokeWidth: 2,
    strokeDashArray: [5, 5],
    rx: 4,
    ry: 4,
    selectable: false,
    evented: true, // Crucial: must be true to receive drag & drop events!
    // Store metadata so we know this is a grid placeholder
    name: "grid-placeholder",
  });
  canvas.add(rect);
}

/**
 * Populate a Fabric canvas with objects derived from a grid layout
 * (GridCell[]) and placed page elements.
 *
 * - Image cells with a photo → fabric.FabricImage clipped to the cell area
 * - Empty image cells → light gray placeholder Rect
 * - Text cells → fabric.Textbox with content or placeholder
 */
export async function buildCanvasFromGrid(
  canvas: fabric.Canvas,
  cells: GridCell[],
  elements: PageElement[],
  canvasWidth: number,
  canvasHeight: number,
): Promise<void> {
  // Clear all existing objects (keep page rect and background)
  canvas.getObjects().forEach((obj) => {
    if ((obj as any).__isPageRect) return; // Keep the page rect
    canvas.remove(obj);
  });
  canvas.backgroundColor = "#e5e7eb";

  for (const cell of cells) {
    // Convert percentage positions to absolute pixel positions
    const left = (cell.x / 100) * canvasWidth;
    const top = (cell.y / 100) * canvasHeight;
    const width = (cell.w / 100) * canvasWidth;
    const height = (cell.h / 100) * canvasHeight;

    const element = findElementForCell(cell, elements);

    if (cell.type === "text") {
      // ─── Text cell ───
      const textContent =
        element?.element_type === "text" && element.content
          ? element.content
          : cell.placeholder ?? "Texte";

      const fontSize = cell.fontSize
        ? Math.round((cell.fontSize / 100) * Math.min(canvasWidth, canvasHeight))
        : 24;

      const textbox = new fabric.Textbox(textContent, {
        left,
        top,
        width,
        fontSize,
        fontWeight: (cell.fontWeight as string) || "bold",
        fill: cell.textColor || "#000000",
        textAlign: (cell.textAlign as string) || "left",
        name: "grid-text",
      });
      canvas.add(textbox);
    } else if (element?.content && element.element_type === "image") {
      // ─── Image cell with a placed photo ───
      try {
        const img = await fabric.FabricImage.fromURL(element.content, {
          crossOrigin: "anonymous",
        });

        const imgW = img.width || 1;
        const imgH = img.height || 1;

        // Scale to COVER the cell (like object-fit: cover)
        const scaleX = width / imgW;
        const scaleY = height / imgH;
        const scale = Math.max(scaleX, scaleY);

        img.set({
          left: left + width / 2,
          top: top + height / 2,
          originX: "center",
          originY: "center",
          scaleX: scale,
          scaleY: scale,
          // Clip to the cell boundaries (absolute canvas coordinates)
          clipPath: new fabric.Rect({
            left,
            top,
            width,
            height,
            absolutePositioned: true,
          }),
          name: "grid-image",
        });

        canvas.add(img);
      } catch (err) {
        console.warn("[grid-to-fabric] Failed to load image:", err);
        addPlaceholderRect(canvas, left, top, width, height);
      }
    } else {
      // ─── Empty image cell ───
      addPlaceholderRect(canvas, left, top, width, height);
    }
  }

  canvas.requestRenderAll();
}

/**
 * Build a Fabric canvas from a layout + elements + optional background color.
 * Convenience wrapper used by TemplateEditorModal.
 */
export async function buildCanvasFromGridSafe(
  canvas: fabric.Canvas | null | undefined,
  cells: GridCell[],
  elements: PageElement[],
  canvasWidth: number,
  canvasHeight: number,
): Promise<boolean> {
  if (!canvas) return false;
  try {
    await buildCanvasFromGrid(canvas, cells, elements, canvasWidth, canvasHeight);
    return true;
  } catch (err) {
    console.error("[grid-to-fabric] buildCanvasFromGrid failed:", err);
    return false;
  }
}
