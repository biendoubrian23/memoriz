"use client";

/* ─────────────────────────────────────────────────────────────
   CanvasEditor — Main Fabric.js canvas component (Canva-like)
   ───────────────────────────────────────────────────────────── */

import {
  useRef,
  useEffect,
  useState,
  useCallback,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as fabric from "fabric";
import { createFabricCanvas, enableSnapping, enableBleedIndicators } from "@/lib/template-editor/fabric-init";
import { HistoryManager } from "@/lib/template-editor/history";
import { loadAllFonts } from "@/lib/template-editor/font-loader";
import { CLIP_FRAME_PRESETS, createClipFrame } from "@/lib/template-editor/element-presets";

export type CanvasEditorHandle = {
  getCanvas: () => fabric.Canvas | null;
  getHistory: () => HistoryManager | null;
  addObject: (obj: fabric.FabricObject) => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  bringToFront: () => void;
  sendToBack: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  zoomFit: () => void;
  setZoom: (z: number) => void;
  getZoom: () => number;
  getObjects: () => fabric.FabricObject[];
  toJSON: () => string;
  toDataURL: (multiplier?: number) => string;
  loadFromJSON: (json: string) => Promise<void>;
  setBackgroundColor: (color: string) => void;
  setBackgroundGradient: (colors: string[], angle?: number) => void;
  setBackgroundImage: (url: string) => Promise<void>;
  clearCanvas: () => void;
  selectAll: () => void;
  getSelectedObject: () => fabric.FabricObject | null;
};

type Props = {
  width: number;
  height: number;
  onSelectionChange?: (obj: fabric.FabricObject | null) => void;
  onObjectModified?: () => void;
  onCanvasReady?: (canvas: fabric.Canvas) => void;
  onZoomChange?: (zoom: number) => void;
  /** Called when a layout card is dropped onto the canvas */
  onDropLayout?: (layoutId: string) => void;
  /** Page navigation callbacks */
  onNextPage?: () => void;
  onPrevPage?: () => void;
};

const CanvasEditor = forwardRef<CanvasEditorHandle, Props>(
  ({ width, height, onSelectionChange, onObjectModified, onCanvasReady, onZoomChange, onDropLayout, onNextPage, onPrevPage }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const historyRef = useRef<HistoryManager | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRectRef = useRef<fabric.Rect | null>(null);
    const [zoom, setZoomState] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef<{ x: number; y: number } | null>(null);

    /* ── Context Menu State ── */
    const [contextMenu, setContextMenu] = useState<{
      x: number;
      y: number;
      target: fabric.FabricObject;
      targetType: "group" | "image" | "other";
    } | null>(null);
    const startCropModeRef = useRef<((target: fabric.FabricObject) => void) | null>(null);

    /* ── Helper: center the page in the container at a given zoom ── */
    const centerPage = useCallback((canvas: fabric.Canvas, z: number) => {
      const container = containerRef.current;
      if (!container) return;
      const cW = container.clientWidth;
      const cH = container.clientHeight;
      const panX = (cW - width * z) / 2;
      const panY = (cH - height * z) / 2;
      canvas.setViewportTransform([z, 0, 0, z, panX, panY]);
    }, [width, height]);

    /* ── Helper: restore workspace after any loadFromJSON (undo/redo/load) ── */
    const restoreWorkspace = useCallback((canvas: fabric.Canvas) => {
      canvas.backgroundColor = "#e5e7eb";
      if (pageRectRef.current) {
        const existing = canvas.getObjects().find((o: any) => o.__isPageRect);
        if (!existing) {
          canvas.add(pageRectRef.current);
        }
        canvas.sendObjectToBack(pageRectRef.current);
      }
    }, []);

    /* ── Initialize canvas ── */
    useEffect(() => {
      if (!canvasRef.current || !containerRef.current) return;

      // Load all Google Fonts
      loadAllFonts();

      // Canvas fills the entire container
      const cW = containerRef.current.clientWidth;
      const cH = containerRef.current.clientHeight;

      const canvas = createFabricCanvas(canvasRef.current, cW, cH);
      fabricRef.current = canvas;

      // Make canvas background a visible gray workspace (like Canva)
      canvas.backgroundColor = "#e5e7eb";

      // Add a white rectangle as the "page" — with a prominent shadow for clear boundary
      const pageRect = new fabric.Rect({
        left: 0,
        top: 0,
        width,
        height,
        fill: "#ffffff",
        selectable: false,
        evented: false,
        excludeFromExport: true,
        hoverCursor: "default",
        shadow: new fabric.Shadow({ color: 'rgba(0,0,0,0.25)', blur: 30, offsetX: 0, offsetY: 2 }),
      });
      (pageRect as any).__isPageRect = true;
      canvas.add(pageRect);
      canvas.sendObjectToBack(pageRect);
      pageRectRef.current = pageRect;

      // Enable snapping (pass page dimensions for accurate edge detection)
      enableSnapping(canvas, width, height);

      // Enable bleed indicators (dashed red lines when objects overflow)
      enableBleedIndicators(canvas, width, height);

      // Center the page at initial fit zoom
      const fitZ = Math.min((cW - 60) / width, (cH - 60) / height, 1);
      centerPage(canvas, fitZ);
      setZoomState(fitZ);

      // History manager (with afterRestore callback to keep workspace intact)
      const history = new HistoryManager(canvas, () => {
        restoreWorkspace(canvas);
      });
      historyRef.current = history;

      // Event listeners
      canvas.on("selection:created", (e) => {
        onSelectionChange?.(e.selected?.[0] ?? null);
      });
      canvas.on("selection:updated", (e) => {
        onSelectionChange?.(e.selected?.[0] ?? null);
      });
      canvas.on("selection:cleared", () => {
        onSelectionChange?.(null);
      });
      canvas.on("object:modified", () => {
        history.saveState();
        onObjectModified?.();
      });
      canvas.on("text:changed", () => {
        history.saveState();
      });

      onCanvasReady?.(canvas);

      return () => {
        canvas.dispose();
        fabricRef.current = null;
        historyRef.current = null;
        pageRectRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [width, height]);

    /* ── Keyboard shortcuts ── */
    useEffect(() => {
      const canvas = fabricRef.current;
      const history = historyRef.current;
      if (!canvas || !history) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        // Don't intercept when editing text
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) return;
        // Also don't intercept when Fabric is in edit mode
        const activeObj = canvas.getActiveObject();
        if (activeObj && activeObj instanceof fabric.Textbox && (activeObj as fabric.Textbox).isEditing) return;

        const ctrl = e.ctrlKey || e.metaKey;

        // Delete
        if (e.key === "Delete" || e.key === "Backspace") {
          e.preventDefault();
          deleteSelected();
        }
        // Ctrl+Z — Undo
        if (ctrl && e.key === "z" && !e.shiftKey) {
          e.preventDefault();
          history.undo().then(() => canvas.requestRenderAll());
        }
        // Ctrl+Y or Ctrl+Shift+Z — Redo
        if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
          e.preventDefault();
          history.redo().then(() => canvas.requestRenderAll());
        }
        // Ctrl+C — Copy
        if (ctrl && e.key === "c") {
          e.preventDefault();
          const obj = canvas.getActiveObject();
          if (obj) {
            obj.clone().then((cloned: fabric.FabricObject) => {
              (window as unknown as Record<string, unknown>)._fabricClipboard = cloned;
            });
          }
        }
        // Ctrl+V — Paste
        if (ctrl && e.key === "v") {
          e.preventDefault();
          const clipboard = (window as unknown as Record<string, unknown>)._fabricClipboard as fabric.FabricObject | undefined;
          if (clipboard) {
            clipboard.clone().then((cloned: fabric.FabricObject) => {
              cloned.set({
                left: (cloned.left ?? 0) + 20,
                top: (cloned.top ?? 0) + 20,
              });
              canvas.add(cloned);
              canvas.setActiveObject(cloned);
              history.saveState();
              canvas.requestRenderAll();
            });
          }
        }
        // Ctrl+D — Duplicate
        if (ctrl && e.key === "d") {
          e.preventDefault();
          duplicateSelected();
        }
        // Ctrl+A — Select all
        if (ctrl && e.key === "a") {
          e.preventDefault();
          selectAll();
        }
        // Arrow keys — move selection
        if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
          const obj = canvas.getActiveObject();
          if (!obj) return;
          e.preventDefault();
          const step = e.shiftKey ? 10 : 1;
          switch (e.key) {
            case "ArrowUp": obj.set({ top: (obj.top ?? 0) - step }); break;
            case "ArrowDown": obj.set({ top: (obj.top ?? 0) + step }); break;
            case "ArrowLeft": obj.set({ left: (obj.left ?? 0) - step }); break;
            case "ArrowRight": obj.set({ left: (obj.left ?? 0) + step }); break;
          }
          obj.setCoords();
          canvas.requestRenderAll();
          history.saveState();
        }
        // Space — toggle pan mode
        if (e.key === " " && !ctrl) {
          e.preventDefault();
          setIsPanning(true);
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.key === " ") {
          setIsPanning(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      window.addEventListener("keyup", handleKeyUp);
      return () => {
        window.removeEventListener("keydown", handleKeyDown);
        window.removeEventListener("keyup", handleKeyUp);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* ── Mouse wheel zoom ── */
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      const handleWheel = (opt: fabric.TEvent<WheelEvent>) => {
        const e = opt.e;
        e.preventDefault();
        e.stopPropagation();

        const currentZoom = canvas.getZoom();
        const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
        let newZoom = currentZoom * zoomFactor;
        newZoom = Math.max(0.10, Math.min(4, newZoom));
        if (Math.abs(newZoom - 1) < 0.03) newZoom = 1;

        // Same behavior as the slider: always center the page
        centerPage(canvas, newZoom);
        canvas.requestRenderAll();
        setZoomState(newZoom);
        onZoomChange?.(newZoom);
      };

      canvas.on("mouse:wheel", handleWheel);
      return () => {
        canvas.off("mouse:wheel", handleWheel);
      };
    }, [onZoomChange, centerPage]);

    /* ── Pan mode ── */
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      if (isPanning) {
        canvas.defaultCursor = "grab";
        canvas.selection = false;
      } else {
        canvas.defaultCursor = "default";
        canvas.selection = true;
        panStart.current = null;
      }

      const handleMouseDown = (opt: fabric.TPointerEventInfo) => {
        if (!isPanning) return;
        canvas.defaultCursor = "grabbing";
        const e = opt.e as MouseEvent;
        panStart.current = { x: e.clientX, y: e.clientY };
      };

      const handleMouseMove = (opt: fabric.TPointerEventInfo) => {
        if (!isPanning || !panStart.current) return;
        const e = opt.e as MouseEvent;
        const vpt = canvas.viewportTransform;
        if (!vpt) return;
        vpt[4] += e.clientX - panStart.current.x;
        vpt[5] += e.clientY - panStart.current.y;
        panStart.current = { x: e.clientX, y: e.clientY };
        canvas.requestRenderAll();
      };

      const handleMouseUp = () => {
        if (!isPanning) return;
        canvas.defaultCursor = "grab";
        panStart.current = null;
      };

      canvas.on("mouse:down", handleMouseDown);
      canvas.on("mouse:move", handleMouseMove);
      canvas.on("mouse:up", handleMouseUp);

      return () => {
        canvas.off("mouse:down", handleMouseDown);
        canvas.off("mouse:move", handleMouseMove);
        canvas.off("mouse:up", handleMouseUp);
      };
    }, [isPanning]);

    /* ── Crop Mode (Double Click on Frame) ── */
    useEffect(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;

      let cropState: {
        group: fabric.Group;
        img: fabric.FabricImage;
        cloneImg: fabric.FabricImage;
        overlay: fabric.FabricObject;
      } | null = null;
      let lastClickTime = 0;
      let lastClickTarget: any = null;

      const startCropMode = (group: fabric.Group) => {
        const img = group.getObjects().find(o => (o as any).isFrameImage || o.type === "image" || o.isType?.("image")) as fabric.FabricImage | undefined;
        if (!img) return;

        // Clone the image for interactions so the group stays structurally intact
        img.clone().then((cloneImg: any) => {
          // calcTransformMatrix() gives the WORLD-space center of the image
          const imgMatrix = img.calcTransformMatrix();
          const decomposed = fabric.util.qrDecompose(imgMatrix);

          // translateX/Y from qrDecompose = center of the object in world coords
          cloneImg.set({
            originX: "center",
            originY: "center",
            left: decomposed.translateX,
            top: decomposed.translateY,
            scaleX: decomposed.scaleX,
            scaleY: decomposed.scaleY,
            angle: decomposed.angle,
            opacity: 0.6,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            evented: true,
          });

          // Create an overlay so the user sees the frame shape
          group.clipPath!.clone().then((overlay: any) => {
            overlay.set({
              left: group.left,
              top: group.top,
              scaleX: group.scaleX,
              scaleY: group.scaleY,
              angle: group.angle,
              originX: group.originX,
              originY: group.originY,
              fill: "rgba(0,0,0,0.05)",
              stroke: "#3b82f6",
              strokeWidth: 2 / canvas.getZoom(),
              strokeDashArray: [5, 5],
              selectable: false,
              evented: false,
              absolutePositioned: false,
            });

            group.visible = false; // Hide the entire intact group

            canvas.add(overlay);
            canvas.add(cloneImg);
            canvas.setActiveObject(cloneImg);

            cropState = { group, img, cloneImg, overlay };
            canvas.requestRenderAll();
          });
        });
      };

      /* ── Standalone image crop mode ── */
      let imageCropState: {
        img: fabric.FabricImage;
        cropRect: fabric.Rect;
        originalOpacity: number;
      } | null = null;

      const startImageCropMode = (img: fabric.FabricImage) => {
        // Create a crop rectangle matching current visible area
        img.setCoords();
        const tl = img.aCoords?.tl ?? new fabric.Point(img.left ?? 0, img.top ?? 0);

        const imgWidth = (img.width ?? 100) * (img.scaleX ?? 1);
        const imgHeight = (img.height ?? 100) * (img.scaleY ?? 1);

        const cropRect = new fabric.Rect({
          left: tl.x,
          top: tl.y,
          width: imgWidth,
          height: imgHeight,
          fill: "rgba(255,255,255,0.15)",
          stroke: "#3b82f6",
          strokeWidth: 2 / canvas.getZoom(),
          strokeDashArray: [6, 4],
          cornerColor: "#3b82f6",
          cornerStyle: "circle",
          cornerSize: 10,
          transparentCorners: false,
          hasRotatingPoint: false,
          lockRotation: true,
          selectable: true,
          evented: true,
          excludeFromExport: true,
        });
        (cropRect as any).__isCropRect = true;

        // Dim the original image
        const originalOpacity = img.opacity ?? 1;
        img.set({ opacity: 0.4, selectable: false, evented: false });

        canvas.add(cropRect);
        canvas.setActiveObject(cropRect);
        canvas.requestRenderAll();

        imageCropState = { img, cropRect, originalOpacity };
      };

      const finishImageCrop = () => {
        if (!imageCropState) return;
        const { img, cropRect, originalOpacity } = imageCropState;

        // Get crop rect bounds in canvas coordinates
        const cropLeft = cropRect.left ?? 0;
        const cropTop = cropRect.top ?? 0;
        const cropW = (cropRect.width ?? 0) * (cropRect.scaleX ?? 1);
        const cropH = (cropRect.height ?? 0) * (cropRect.scaleY ?? 1);

        // Convert to source-image pixel coordinates based on actual rendering position
        const imgScaleX = img.scaleX ?? 1;
        const imgScaleY = img.scaleY ?? 1;

        img.setCoords();
        const tl = img.aCoords?.tl ?? new fabric.Point(img.left ?? 0, img.top ?? 0);

        // Pixel offset within the source image where crop starts
        const srcCropX = (cropLeft - tl.x) / imgScaleX;
        const srcCropY = (cropTop - tl.y) / imgScaleY;
        // Pixel dimensions of the cropped region
        const srcCropW = cropW / imgScaleX;
        const srcCropH = cropH / imgScaleY;

        // Use Fabric's native cropX/cropY + width/height for proper bounding box
        img.set({
          cropX: Math.max(0, srcCropX + (img.cropX ?? 0)),
          cropY: Math.max(0, srcCropY + (img.cropY ?? 0)),
          width: srcCropW,
          height: srcCropH,
          originX: "left",
          originY: "top",
          left: cropLeft,
          top: cropTop,
          opacity: originalOpacity,
          selectable: true,
          evented: true,
          dirty: true,
        });

        canvas.remove(cropRect);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        historyRef.current?.saveState();
        imageCropState = null;
      };

      const cancelImageCrop = () => {
        if (!imageCropState) return;
        const { img, cropRect, originalOpacity } = imageCropState;
        img.set({ opacity: originalOpacity, selectable: true, evented: true });
        canvas.remove(cropRect);
        canvas.requestRenderAll();
        imageCropState = null;
      };

      startCropModeRef.current = (target: fabric.FabricObject) => {
        // Case 1: Group (clip frame) crop
        if (target.type === "group" || target.isType?.("group")) {
          startCropMode(target as fabric.Group);
          return;
        }
        // Case 2: Standalone image crop
        if (target.type === "image" || target.isType?.("image")) {
          startImageCropMode(target as fabric.FabricImage);
        }
      };

      const handleDoubleClick = (opt: fabric.TPointerEventInfo) => {
        let target = opt.target;
        if (!target) return;

        // If the user clicked directly on the image inside the group
        if (target.group && (target.group as any).isImageFrame) {
          target = target.group;
        }

        if (target.type === "group" || target.isType?.("group")) {
          const group = target as fabric.Group;

          // Fallback if isImageFrame is lost during serialization:
          // A group is an image frame if it has a clipPath and contains an Image object.
          const img = group.getObjects().find(o => (o as any).isFrameImage || o.type === "image" || o.isType?.("image")) as fabric.FabricImage | undefined;

          const isFrameGroup = (group as any).isImageFrame || (group.clipPath && img);
          if (!isFrameGroup) return;

          startCropMode(group);
        }
      };

      const handleMouseDown = (opt: fabric.TPointerEventInfo) => {
        // Handle Right Click for Context Menu
        const evt = opt.e as MouseEvent;
        if (evt && evt.button === 2) {
          let target = opt.target;
          if (target && target.group && (target.group as any).isImageFrame) {
            target = target.group;
          }
          // Show context menu for ANY selectable object (skip page rect)
          if (target && !(target as any).__isPageRect) {
            // Determine target type for conditional menu options
            let targetType: "group" | "image" | "other" = "other";
            if (target.type === "group" || target.isType?.("group")) {
              const group = target as fabric.Group;
              const img = group.getObjects().find(o => (o as any).isFrameImage || o.type === "image" || o.isType?.("image"));
              if ((group as any).isImageFrame || (group.clipPath && img)) {
                targetType = "group";
              }
            } else if (target.type === "image" || target.isType?.("image")) {
              targetType = "image";
            }
            canvas.setActiveObject(target);
            setContextMenu({ x: evt.clientX, y: evt.clientY, target, targetType });
            evt.preventDefault();
            return;
          }
          setContextMenu(null);
          return;
        } else {
          setContextMenu(null);
        }

        // Robust Custom Double Click Detection
        const now = Date.now();
        const target = opt.target;
        if (now - lastClickTime < 350 && target === lastClickTarget) {
          handleDoubleClick(opt);
        }
        lastClickTime = now;
        lastClickTarget = target;

        if (!cropState) {
          // Check standalone image crop state
          if (imageCropState && opt.target !== imageCropState.cropRect) {
            finishImageCrop();
          }
          return;
        }

        // If they click on anything other than the cloneImg (or its controls), exit crop mode.
        if (opt.target !== cropState.cloneImg) {
          const { group, img, cloneImg, overlay } = cropState;

          // *** CRITICAL: read clone's world transform BEFORE removing it ***
          const cloneWorldMatrix = cloneImg.calcTransformMatrix();

          // Now safe to remove from canvas
          canvas.remove(overlay);
          canvas.remove(cloneImg);

          // Convert clone's world position to group-local coordinates
          const groupInverted = fabric.util.invertTransform(group.calcTransformMatrix());
          const localMatrix = fabric.util.multiplyTransformMatrices(groupInverted, cloneWorldMatrix);
          const decomposed = fabric.util.qrDecompose(localMatrix);

          // Apply to original image (keep center/center origin to match how it was created)
          img.set({
            originX: "center",
            originY: "center",
            left: decomposed.translateX,
            top: decomposed.translateY,
            scaleX: decomposed.scaleX,
            scaleY: decomposed.scaleY,
            angle: decomposed.angle,
          });

          // Show the group again (image stays inside, never removed)
          group.visible = true;
          group.set('dirty', true);
          img.set('dirty', true);

          canvas.setActiveObject(group);
          cropState = null;
          historyRef.current?.saveState();
          canvas.requestRenderAll();
        }
      };

      canvas.on("mousedblclick" as keyof fabric.CanvasEvents, handleDoubleClick);
      canvas.on("mouse:down", handleMouseDown);

      return () => {
        canvas.off("mousedblclick" as keyof fabric.CanvasEvents, handleDoubleClick);
        canvas.off("mouse:down", handleMouseDown);
      };
    }, [setContextMenu]);

    /* ── Imperative methods ── */
    const deleteSelected = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const active = canvas.getActiveObjects();
      if (active.length === 0) return;
      // Never delete the page rect
      active.forEach((obj) => {
        if ((obj as any).__isPageRect) return;
        canvas.remove(obj);
      });
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      historyRef.current?.saveState();
    }, []);

    const duplicateSelected = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const obj = canvas.getActiveObject();
      if (!obj) return;
      obj.clone().then((cloned: fabric.FabricObject) => {
        cloned.set({
          left: (cloned.left ?? 0) + 20,
          top: (cloned.top ?? 0) + 20,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.requestRenderAll();
        historyRef.current?.saveState();
      });
    }, []);

    const selectAll = useCallback(() => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const objects = canvas.getObjects().filter((o) => !o.excludeFromExport && !(o as any).__isPageRect);
      if (objects.length === 0) return;
      const selection = new fabric.ActiveSelection(objects, { canvas });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
    }, []);

    useImperativeHandle(ref, () => ({
      getCanvas: () => fabricRef.current,
      getHistory: () => historyRef.current,
      getObjects: () => {
        const canvas = fabricRef.current;
        if (!canvas) return [];
        return canvas.getObjects().filter((o) => !o.excludeFromExport);
      },
      addObject: (obj: fabric.FabricObject) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        canvas.add(obj);
        canvas.setActiveObject(obj);
        canvas.requestRenderAll();
        historyRef.current?.saveState();
      },
      deleteSelected,
      duplicateSelected,
      bringForward: () => {
        const canvas = fabricRef.current;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) {
          canvas.bringObjectForward(obj);
          canvas.requestRenderAll();
          historyRef.current?.saveState();
          onObjectModified?.();
        }
      },
      sendBackward: () => {
        const canvas = fabricRef.current;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) {
          canvas.sendObjectBackwards(obj);
          // Ensure page rect stays at bottom
          if (pageRectRef.current) canvas.sendObjectToBack(pageRectRef.current);
          canvas.requestRenderAll();
          historyRef.current?.saveState();
          onObjectModified?.();
        }
      },
      bringToFront: () => {
        const canvas = fabricRef.current;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) {
          canvas.bringObjectToFront(obj);
          canvas.requestRenderAll();
          historyRef.current?.saveState();
          onObjectModified?.();
        }
      },
      sendToBack: () => {
        const canvas = fabricRef.current;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) {
          canvas.sendObjectToBack(obj);
          // Ensure page rect stays at bottom
          if (pageRectRef.current) canvas.sendObjectToBack(pageRectRef.current);
          canvas.requestRenderAll();
          historyRef.current?.saveState();
          onObjectModified?.();
        }
      },
      groupSelected: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (!active || active.type !== "activeSelection") return;
        const sel = active as fabric.ActiveSelection;
        const objects = sel.getObjects().slice();
        canvas.discardActiveObject();
        objects.forEach((o) => canvas.remove(o));
        const group = new fabric.Group(objects);
        canvas.add(group);
        canvas.setActiveObject(group);
        canvas.requestRenderAll();
        historyRef.current?.saveState();
      },
      ungroupSelected: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const active = canvas.getActiveObject();
        if (!active || active.type !== "group") return;
        const group = active as fabric.Group;
        const objects = group.removeAll();
        canvas.remove(group);
        objects.forEach((o) => canvas.add(o));
        const sel = new fabric.ActiveSelection(objects, { canvas });
        canvas.setActiveObject(sel);
        canvas.requestRenderAll();
        historyRef.current?.saveState();
      },
      zoomIn: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const z = Math.min(canvas.getZoom() * 1.15, 4);
        centerPage(canvas, z);
        canvas.requestRenderAll();
        setZoomState(z);
        onZoomChange?.(z);
      },
      zoomOut: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const z = Math.max(canvas.getZoom() / 1.15, 0.10);
        centerPage(canvas, z);
        canvas.requestRenderAll();
        setZoomState(z);
        onZoomChange?.(z);
      },
      zoomFit: () => {
        const canvas = fabricRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const z = Math.min(
          (container.clientWidth - 60) / width,
          (container.clientHeight - 60) / height,
          1
        );
        centerPage(canvas, z);
        canvas.requestRenderAll();
        setZoomState(z);
        onZoomChange?.(z);
      },
      setZoom: (z: number) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const clamped = Math.max(0.10, Math.min(4, z));
        centerPage(canvas, clamped);
        canvas.requestRenderAll();
        setZoomState(clamped);
        onZoomChange?.(clamped);
      },
      getZoom: () => zoom,
      toJSON: () => {
        const canvas = fabricRef.current;
        if (!canvas) return "";
        return JSON.stringify((canvas as any).toJSON(['name', 'id', 'isImageFrame', 'isFrameImage', 'originalFrameId']));
      },
      toDataURL: (multiplier = 2) => {
        const canvas = fabricRef.current;
        if (!canvas) return "";
        // Save current viewport
        const currentVpt = [...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0])];
        // Reset to identity (zoom 1, no pan) for clean export
        canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
        // Temporarily set white bg for export (hide the gray workspace)
        const origBg = canvas.backgroundColor;
        canvas.backgroundColor = "#ffffff";
        const url = canvas.toDataURL({
          format: "png",
          quality: 1,
          multiplier,
          left: 0,
          top: 0,
          width,
          height,
        });
        // Restore
        canvas.backgroundColor = origBg;
        canvas.setViewportTransform(currentVpt as fabric.TMat2D);
        canvas.requestRenderAll();
        return url;
      },
      loadFromJSON: async (json: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        try {
          await canvas.loadFromJSON(json);
          // Verify canvas is still current (React Strict Mode may have disposed it)
          if (fabricRef.current !== canvas) return;

          // ─── Re-apply workspace after JSON load (JSON overwrites backgroundColor) ───
          canvas.backgroundColor = "#e5e7eb";

          // Re-add page rect if it was lost during JSON load
          if (pageRectRef.current) {
            // Remove stale copy if present
            const existing = canvas.getObjects().find((o: any) => o.__isPageRect);
            if (!existing) {
              canvas.add(pageRectRef.current);
            }
            canvas.sendObjectToBack(pageRectRef.current);
          }

          // Re-center the page
          centerPage(canvas, canvas.getZoom());

          canvas.requestRenderAll();
          historyRef.current?.clear();
        } catch (err) {
          console.warn("[CanvasEditor] loadFromJSON failed (canvas may have been disposed):", err);
        }
      },
      setBackgroundColor: (color: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        // Set the page rect fill (not the workspace background)
        if (pageRectRef.current) {
          pageRectRef.current.set({ fill: color });
        }
        canvas.requestRenderAll();
        historyRef.current?.saveState();
      },
      setBackgroundGradient: (colors: string[], angle = 180) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const radian = (angle * Math.PI) / 180;
        const x2 = Math.cos(radian) * width;
        const y2 = Math.sin(radian) * height;
        const gradient = new fabric.Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2, y2 },
          colorStops: colors.map((color, i) => ({
            offset: i / (colors.length - 1),
            color,
          })),
        });
        // Apply gradient to page rect (not canvas workspace bg)
        if (pageRectRef.current) {
          pageRectRef.current.set({ fill: gradient });
        }
        canvas.requestRenderAll();
        historyRef.current?.saveState();
      },
      setBackgroundImage: async (url: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
        img.scaleToWidth(canvas.getWidth());
        img.scaleToHeight(canvas.getHeight());
        canvas.backgroundImage = img;
        canvas.requestRenderAll();
        historyRef.current?.saveState();
      },
      clearCanvas: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        canvas.clear();
        canvas.backgroundColor = "#e5e7eb";
        // Re-add page rect
        if (pageRectRef.current) {
          canvas.add(pageRectRef.current);
          canvas.sendObjectToBack(pageRectRef.current);
        }
        canvas.requestRenderAll();
        historyRef.current?.clear();
      },
      selectAll,
      getSelectedObject: () => {
        return fabricRef.current?.getActiveObject() ?? null;
      },
    }));

    /* ── Drop handler: accept layouts and images dragged from the sidebar ── */
    const dragTargetRef = useRef<fabric.FabricObject | null>(null);

    const getDropTarget = useCallback((e: React.DragEvent) => {
      const canvas = fabricRef.current;
      if (!canvas) return null;

      const canvasEl = canvas.getElement();
      const rect = canvasEl.getBoundingClientRect();
      const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
      const z = canvas.getZoom();
      const canvasX = (e.clientX - rect.left - vpt[4]) / z;
      const canvasY = (e.clientY - rect.top - vpt[5]) / z;
      const dropPoint = new fabric.Point(canvasX, canvasY);

      // Check objects top-to-bottom
      const target = canvas.getObjects().slice().reverse().find((obj) => {
        const objName = (obj as unknown as { name?: string }).name;
        const isGrid = objName === "grid-placeholder" || objName === "grid-image";
        const isFrame = (obj as any).isImageFrame === true;
        if (!isGrid && !isFrame) return false;

        // If the object uses an absolute clipPath (like grid images), 
        // the drop must be inside the clipPath (the visible cell) 
        //, not the full hidden image bounds.
        if (obj.clipPath && obj.clipPath.absolutePositioned) {
          return obj.clipPath.containsPoint(dropPoint);
        }

        return obj.containsPoint(dropPoint);
      });
      return { target, canvasX, canvasY };
    }, []);

    const clearDragHighlight = useCallback(() => {
      if (dragTargetRef.current) {
        const target = dragTargetRef.current;
        const objName = (target as unknown as { name?: string }).name;

        if (objName === "grid-placeholder") {
          target.set({ stroke: "#d1d5db", strokeWidth: 2, fill: "transparent" });
        } else {
          target.set({ opacity: (target as any).__originalOpacity ?? 1 });
          delete (target as any).__originalOpacity;
        }
        fabricRef.current?.requestRenderAll();
        dragTargetRef.current = null;
      }
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";

      const info = getDropTarget(e);
      const target = info?.target ?? null;

      if (target !== dragTargetRef.current) {
        clearDragHighlight();
        if (target) {
          const objName = (target as unknown as { name?: string }).name;
          if (objName === "grid-placeholder") {
            // Highlight placeholder cell
            target.set({ stroke: "#3b82f6", strokeWidth: 3, fill: "rgba(59, 130, 246, 0.15)" });
          } else {
            // Highlight existing image by dimming it
            (target as any).__originalOpacity = target.opacity ?? 1;
            target.set({ opacity: 0.6 });
          }
          fabricRef.current?.requestRenderAll();
          dragTargetRef.current = target;
        }
      }
    }, [getDropTarget, clearDragHighlight]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      clearDragHighlight();
    }, [clearDragHighlight]);

    const handleDrop = useCallback(
      async (e: React.DragEvent) => {
        e.preventDefault();

        /* ── Case 1: Layout card dropped onto canvas ── */
        const layoutId = e.dataTransfer.getData("application/memoriz-layout");
        if (layoutId) {
          onDropLayout?.(layoutId);
          return;
        }

        const canvas = fabricRef.current;
        if (!canvas) return;

        clearDragHighlight(); // Wipe hover styles before dropping

        const info = getDropTarget(e);
        if (!info) return;
        const { target: dropTarget, canvasX, canvasY } = info;

        /* ── Case 1.5: Clip Frame dropped onto canvas ── */
        const frameId = e.dataTransfer.getData("application/memoriz-clipframe");
        if (frameId) {
          const preset = CLIP_FRAME_PRESETS.find(f => f.id === frameId);
          if (preset) {
            const frameObj = createClipFrame(canvas, preset);

            // Re-center around drop point
            const bbox = frameObj.getBoundingRect();
            frameObj.set({
              left: canvasX - bbox.width / 2,
              top: canvasY - bbox.height / 2,
            });

            canvas.add(frameObj);
            canvas.setActiveObject(frameObj);
            canvas.requestRenderAll();
            historyRef.current?.saveState();
            onObjectModified?.();
          }
          return;
        }

        /* ── Case 2: Image dropped from sidebar ── */
        const url =
          e.dataTransfer.getData("application/x-memoriz-image") ||
          e.dataTransfer.getData("text/plain");
        if (!url || !url.startsWith("http")) return;

        if (dropTarget) {
          const isFrame = (dropTarget as any).isImageFrame === true;
          const targetName = (dropTarget as unknown as { name?: string }).name;

          try {
            const img = await fabric.FabricImage.fromURL(url, {
              crossOrigin: "anonymous",
            });
            const imgW = img.width || 1;
            const imgH = img.height || 1;

            if (isFrame) {
              /* ── Photo dropped into a Canvas Frame (Blob, Shape, etc) ── */
              const bbox = dropTarget.getBoundingRect();
              const groupScaleX = dropTarget.scaleX || 1;
              const groupScaleY = dropTarget.scaleY || 1;
              const frameW = dropTarget.width || 1;
              const frameH = dropTarget.height || 1;

              // Calculate scale to cover the frame bounding box
              const scale = Math.max(bbox.width / imgW, bbox.height / imgH);
              const innerScaleX = scale / groupScaleX;
              const innerScaleY = scale / groupScaleY;

              img.set({
                left: 0,
                top: 0,
                originX: "center",
                originY: "center",
                scaleX: innerScaleX,
                scaleY: innerScaleY,
              });
              (img as any).isFrameImage = true;

              if (dropTarget.type === "group" || dropTarget.isType?.("group")) {
                // Already a frame group, replace the image
                const group = dropTarget as fabric.Group;
                const oldImg = group.getObjects().find(o => (o as any).isFrameImage || o.type === "image" || o.isType?.("image"));
                if (oldImg) {
                  group.remove(oldImg);
                }
                group.add(img);
                canvas.setActiveObject(group);
                canvas.requestRenderAll();
                historyRef.current?.saveState();
                onObjectModified?.();
              } else {
                // Empty frame (fabric.Path)
                dropTarget.clone().then((clipPathObj: fabric.FabricObject) => {
                  clipPathObj.set({
                    left: 0,
                    top: 0,
                    originX: "center",
                    originY: "center",
                    absolutePositioned: false,
                    scaleX: 1,
                    scaleY: 1,
                    angle: 0,
                  });

                  // We must ensure the group center corresponds to the path's visual center
                  const leftPos = dropTarget.left! + (frameW * groupScaleX) / 2;
                  const topPos = dropTarget.top! + (frameH * groupScaleY) / 2;

                  const group = new fabric.Group([img], {
                    left: leftPos,
                    top: topPos,
                    originX: "center",
                    originY: "center",
                    scaleX: groupScaleX,
                    scaleY: groupScaleY,
                    angle: dropTarget.angle,
                    clipPath: clipPathObj,
                    name: targetName,
                  });

                  (group as any).isImageFrame = true;
                  (group as any).originalFrameId = (dropTarget as any).originalFrameId;

                  const idx = canvas.getObjects().indexOf(dropTarget);
                  canvas.remove(dropTarget);
                  canvas.insertAt(idx, group);
                  canvas.setActiveObject(group);
                  canvas.requestRenderAll();
                  historyRef.current?.saveState();
                  onObjectModified?.();
                });
              }

            } else {
              /* ── Photo dropped into a grid cell ── */
              let cellLeft: number, cellTop: number, cellWidth: number, cellHeight: number;

              if (targetName === "grid-placeholder") {
                cellLeft = dropTarget.left ?? 0;
                cellTop = dropTarget.top ?? 0;
                cellWidth = dropTarget.width ?? 1;
                cellHeight = dropTarget.height ?? 1;
              } else if (dropTarget.clipPath) {
                cellLeft = dropTarget.clipPath.left ?? 0;
                cellTop = dropTarget.clipPath.top ?? 0;
                cellWidth = dropTarget.clipPath.width ?? 1;
                cellHeight = dropTarget.clipPath.height ?? 1;
              } else {
                const sw = (dropTarget.width ?? 0) * (dropTarget.scaleX ?? 1);
                const sh = (dropTarget.height ?? 0) * (dropTarget.scaleY ?? 1);
                cellLeft = (dropTarget.left ?? 0) - sw / 2;
                cellTop = (dropTarget.top ?? 0) - sh / 2;
                cellWidth = sw;
                cellHeight = sh;
              }

              const scaleX = cellWidth / imgW;
              const scaleY = cellHeight / imgH;
              const scale = Math.max(scaleX, scaleY);

              img.set({
                left: cellLeft + cellWidth / 2,
                top: cellTop + cellHeight / 2,
                originX: "center",
                originY: "center",
                scaleX: scale,
                scaleY: scale,
                clipPath: new fabric.Rect({
                  left: cellLeft,
                  top: cellTop,
                  width: cellWidth,
                  height: cellHeight,
                  absolutePositioned: true,
                }),
                name: "grid-image",
              });

              const idx = canvas.getObjects().indexOf(dropTarget);
              canvas.remove(dropTarget);
              canvas.insertAt(idx, img);
              canvas.setActiveObject(img);
              canvas.requestRenderAll();
              historyRef.current?.saveState();
              onObjectModified?.();
            }
          } catch (err) {
            console.error("Error dropping image into target:", err);
          }
          return;
        }

        /* ── Free drop (no grid cell at this position) ── */
        try {
          const img = await fabric.FabricImage.fromURL(url, {
            crossOrigin: "anonymous",
          });
          const maxDim = Math.min(canvas.getWidth(), canvas.getHeight()) * 0.4;
          const scale = Math.min(
            maxDim / (img.width ?? 1),
            maxDim / (img.height ?? 1),
            1
          );
          img.set({
            left: canvasX - ((img.width ?? 0) * scale) / 2,
            top: canvasY - ((img.height ?? 0) * scale) / 2,
            scaleX: scale,
            scaleY: scale,
            name: "Image importée",
          });
          canvas.add(img);
          canvas.setActiveObject(img);
          canvas.requestRenderAll();
          historyRef.current?.saveState();
          onObjectModified?.();
        } catch (err) {
          console.error("Error dropping image:", err);
        }
      },
      [onObjectModified, onDropLayout]
    );

    return (
      <div
        ref={containerRef}
        className="flex-1 bg-gray-100 overflow-hidden"
        style={{ position: "relative", width: "100%", height: "100%" }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <canvas ref={canvasRef} />

        {/* Floating page navigation buttons */}
        {onPrevPage && (
          <button
            onClick={onPrevPage}
            title="Page précédente"
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-gray-300 shadow-lg flex items-center justify-center transition-all hover:scale-110"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
        {onNextPage && (
          <button
            onClick={onNextPage}
            title="Page suivante"
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-gray-300 shadow-lg flex items-center justify-center transition-all hover:scale-110"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Right-click Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-[200] bg-white rounded-lg shadow-xl border border-gray-200 py-1.5 w-52"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseLeave={() => setContextMenu(null)}
          >
            {/* Crop option — only for images and image-frame groups */}
            {(contextMenu.targetType === "image" || contextMenu.targetType === "group") && (
              <>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
                  onClick={() => {
                    const canvas = fabricRef.current;
                    if (!canvas) return;
                    setContextMenu(null);
                    canvas.setActiveObject(contextMenu.target);
                    if (startCropModeRef.current) {
                      startCropModeRef.current(contextMenu.target);
                    }
                  }}
                >
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 3v4m0 0H3m4 0h10a2 2 0 012 2v10m0 0v4m0-4h4M7 7l10 10" />
                  </svg>
                  Rogner l&apos;image
                </button>
                <div className="border-t border-gray-100 my-1" />
              </>
            )}

            {/* Duplicate */}
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3"
              onClick={() => {
                setContextMenu(null);
                duplicateSelected();
              }}
            >
              <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Dupliquer
            </button>

            {/* Delete */}
            <button
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
              onClick={() => {
                setContextMenu(null);
                deleteSelected();
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Supprimer
            </button>
          </div>
        )}
      </div>
    );
  });

CanvasEditor.displayName = "CanvasEditor";
export default CanvasEditor;
