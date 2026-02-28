/* ─────────────────────────────────────────────────────────────
   grid-to-fabric — Convert a grid layout into a single Fabric.js
   Group element that can be placed on top of existing canvas content.
   ───────────────────────────────────────────────────────────── */

import * as fabric from "fabric";
import type { GridCell, PageElement } from "@/lib/types/editor";

/** Path to the default placeholder image shown in empty grid cells */
const GRID_PLACEHOLDER_URL = "/editor/grid-placeholder.png";

/** Gap between cells in pixels */
const CELL_GAP = 4;

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
 * Create a single cell image for the grid using cropX/cropY.
 * This guarantees the bounding box stays strictly within the cell boundaries.
 */
async function createCellImage(
  cellLeft: number,
  cellTop: number,
  cellWidth: number,
  cellHeight: number,
  imageUrl: string | null,
): Promise<fabric.FabricImage | fabric.Rect> {
  const url = imageUrl || GRID_PLACEHOLDER_URL;
  let img: fabric.FabricImage;
  try {
    img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
  } catch {
    // Fallback: white rect
    const bgRect = new fabric.Rect({
      left: cellLeft + cellWidth / 2,
      top: cellTop + cellHeight / 2,
      width: cellWidth - CELL_GAP,
      height: cellHeight - CELL_GAP,
      fill: "#ffffff",
      originX: "center",
      originY: "center",
      name: "grid-cell-empty",
    });
    (bgRect as any).__isGridCell = true;
    (bgRect as any).__hasImage = false;
    (bgRect as any).__cellBounds = { w: cellWidth - CELL_GAP, h: cellHeight - CELL_GAP };
    return bgRect;
  }

  const naturalW = img.width || 1;
  const naturalH = img.height || 1;
  const targetW = cellWidth - CELL_GAP;
  const targetH = cellHeight - CELL_GAP;

  // Scale to COVER the cell
  const scale = Math.max(targetW / naturalW, targetH / naturalH);

  const cropW = targetW / scale;
  const cropH = targetH / scale;

  // Center crop
  const cropX = (naturalW - cropW) / 2;
  const cropY = (naturalH - cropH) / 2;

  img.set({
    left: cellLeft + cellWidth / 2,
    top: cellTop + cellHeight / 2,
    originX: "center",
    originY: "center",
    width: cropW,
    height: cropH,
    cropX: cropX,
    cropY: cropY,
    scaleX: scale,
    scaleY: scale,
    name: imageUrl ? "cell-image" : "cell-placeholder",
  });

  (img as any).isFrameImage = true;
  (img as any).__isGridCell = true;
  (img as any).__hasImage = !!imageUrl;
  (img as any).originalNaturalW = naturalW;
  (img as any).originalNaturalH = naturalH;
  // Save unscaled cell targets. We use targetW/H instead of cellLeft as they are dimensions.
  (img as any).__cellBounds = { w: targetW, h: targetH };

  return img;
}

/**
 * Create a grid as a single Fabric.js Group element.
 *
 * @param cells     The grid layout definition (cell positions in %)
 * @param elements  Any pre-placed images/text
 * @param canvasWidth   Target canvas width in px
 * @param canvasHeight  Target canvas height in px
 * @returns A fabric.Group containing all grid cells
 */
export async function createGridGroup(
  cells: GridCell[],
  elements: PageElement[],
  canvasWidth: number,
  canvasHeight: number,
): Promise<fabric.Group> {
  const cellObjects: fabric.FabricObject[] = [];

  for (const cell of cells) {
    if (cell.type === "text") continue;

    const left = (cell.x / 100) * canvasWidth;
    const top = (cell.y / 100) * canvasHeight;
    const w = (cell.w / 100) * canvasWidth;
    const h = (cell.h / 100) * canvasHeight;

    const element = findElementForCell(cell, elements);
    const imageUrl =
      element?.content && element.element_type === "image"
        ? element.content
        : null;

    const cellObj = await createCellImage(left, top, w, h, imageUrl);
    cellObjects.push(cellObj);
  }

  // Wrap all cells into a single parent group without enforcing originX/Y.
  // Fabric automatically figures out the correct bounding box to perfectly fit the elements.
  const gridGroup = new fabric.Group(cellObjects, {
    name: "grid-group",
    subTargetCheck: true,
  });

  (gridGroup as any).__isGrid = true;

  return gridGroup;
}

/**
 * Create a grid group and add it to the canvas.
 * Unlike the old buildCanvasFromGrid, this does NOT clear existing objects.
 */
export async function addGridToCanvas(
  canvas: fabric.Canvas,
  cells: GridCell[],
  elements: PageElement[],
  canvasWidth: number,
  canvasHeight: number,
): Promise<fabric.Group | null> {
  try {
    const grid = await createGridGroup(cells, elements, canvasWidth, canvasHeight);
    canvas.add(grid);
    canvas.setActiveObject(grid);
    canvas.requestRenderAll();
    return grid;
  } catch (err) {
    console.error("[grid-to-fabric] addGridToCanvas failed:", err);
    return null;
  }
}

/* ── Legacy: kept for backward compatibility with existing page loads ── */

/**
 * Populate a Fabric canvas with objects derived from a grid layout.
 * This is the LEGACY function that clears the canvas first.
 * Used only for initial page load from DB when fabric_json is absent.
 */
export async function buildCanvasFromGrid(
  canvas: fabric.Canvas,
  cells: GridCell[],
  elements: PageElement[],
  canvasWidth: number,
  canvasHeight: number,
): Promise<void> {
  // For legacy loads, we still build from grid but using the new grouped approach
  const grid = await createGridGroup(cells, elements, canvasWidth, canvasHeight);
  canvas.add(grid);
  canvas.requestRenderAll();
}

/**
 * Build a Fabric canvas from a layout + elements.
 * Convenience wrapper used by TemplateEditorModal for initial page load.
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
