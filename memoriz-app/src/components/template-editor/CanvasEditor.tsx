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
import { createFabricCanvas, enableSnapping } from "@/lib/template-editor/fabric-init";
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
};

const CanvasEditor = forwardRef<CanvasEditorHandle, Props>(
  ({ width, height, onSelectionChange, onObjectModified, onCanvasReady, onZoomChange, onDropLayout }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const historyRef = useRef<HistoryManager | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoomState] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef<{ x: number; y: number } | null>(null);

    /* ── Context Menu State ── */
    const [contextMenu, setContextMenu] = useState<{
      x: number;
      y: number;
      target: fabric.Group;
    } | null>(null);
    const startCropModeRef = useRef<((group: fabric.Group) => void) | null>(null);

    /* ── Initialize canvas ── */
    useEffect(() => {
      if (!canvasRef.current) return;

      // Load all Google Fonts
      loadAllFonts();

      const canvas = createFabricCanvas(canvasRef.current, width, height);
      fabricRef.current = canvas;

      // Enable snapping (pass page dimensions for accurate edge detection)
      enableSnapping(canvas, width, height);

      // History manager
      const history = new HistoryManager(canvas);
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
        // Smoother exponential zoom: small steps, consistent feel
        const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;
        let newZoom = currentZoom * zoomFactor;
        // Clamp between 25% and 400%
        newZoom = Math.max(0.25, Math.min(4, newZoom));
        // Snap to 100% when close
        if (Math.abs(newZoom - 1) < 0.03) newZoom = 1;

        const point = new fabric.Point(e.offsetX, e.offsetY);
        canvas.zoomToPoint(point, newZoom);
        setZoomState(newZoom);
        onZoomChange?.(newZoom);
      };

      canvas.on("mouse:wheel", handleWheel);
      return () => {
        canvas.off("mouse:wheel", handleWheel);
      };
    }, [onZoomChange]);

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

      startCropModeRef.current = startCropMode;

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
          if (target && (target.type === "group" || target.isType?.("group"))) {
            const group = target as fabric.Group;
            const img = group.getObjects().find(o => (o as any).isFrameImage || o.type === "image" || o.isType?.("image"));
            const isFrameGroup = (group as any).isImageFrame || (group.clipPath && img);

            if (isFrameGroup) {
              // Show context menu with position (we use DOM coordinates)
              setContextMenu({ x: evt.clientX, y: evt.clientY, target: group });
              evt.preventDefault();
              return;
            }
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

        if (!cropState) return;

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
      active.forEach((obj) => canvas.remove(obj));
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
      const objects = canvas.getObjects().filter((o) => !o.excludeFromExport);
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
        }
      },
      sendBackward: () => {
        const canvas = fabricRef.current;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) {
          canvas.sendObjectBackwards(obj);
          canvas.requestRenderAll();
          historyRef.current?.saveState();
        }
      },
      bringToFront: () => {
        const canvas = fabricRef.current;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) {
          canvas.bringObjectToFront(obj);
          canvas.requestRenderAll();
          historyRef.current?.saveState();
        }
      },
      sendToBack: () => {
        const canvas = fabricRef.current;
        const obj = canvas?.getActiveObject();
        if (canvas && obj) {
          canvas.sendObjectToBack(obj);
          canvas.requestRenderAll();
          historyRef.current?.saveState();
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
        canvas.setZoom(z);
        setZoomState(z);
        onZoomChange?.(z);
      },
      zoomOut: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const z = Math.max(canvas.getZoom() / 1.15, 0.25);
        canvas.setZoom(z);
        setZoomState(z);
        onZoomChange?.(z);
      },
      zoomFit: () => {
        const canvas = fabricRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;
        const containerW = container.clientWidth;
        const containerH = container.clientHeight;
        const canvasW = width;
        const canvasH = height;
        const z = Math.min(
          (containerW - 60) / canvasW,
          (containerH - 60) / canvasH,
          1
        );
        canvas.setZoom(z);
        // Center
        const vpt = canvas.viewportTransform;
        if (vpt) {
          vpt[4] = (containerW - canvasW * z) / 2;
          vpt[5] = (containerH - canvasH * z) / 2;
        }
        canvas.requestRenderAll();
        setZoomState(z);
        onZoomChange?.(z);
      },
      setZoom: (z: number) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const clamped = Math.max(0.25, Math.min(4, z));
        canvas.setZoom(clamped);
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
        // Reset zoom to 1 for export
        const currentZoom = canvas.getZoom();
        const currentVpt = [...(canvas.viewportTransform || [1, 0, 0, 1, 0, 0])];
        canvas.setZoom(1);
        canvas.viewportTransform = [1, 0, 0, 1, 0, 0];
        const url = canvas.toDataURL({ format: "png", quality: 1, multiplier });
        canvas.setZoom(currentZoom);
        canvas.viewportTransform = currentVpt as fabric.TMat2D;
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
          canvas.requestRenderAll();
          historyRef.current?.clear();
        } catch (err) {
          console.warn("[CanvasEditor] loadFromJSON failed (canvas may have been disposed):", err);
        }
      },
      setBackgroundColor: (color: string) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        canvas.backgroundColor = color;
        canvas.requestRenderAll();
        historyRef.current?.saveState();
      },
      setBackgroundGradient: (colors: string[], angle = 180) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const radian = (angle * Math.PI) / 180;
        const x2 = Math.cos(radian) * canvas.getWidth();
        const y2 = Math.sin(radian) * canvas.getHeight();
        const gradient = new fabric.Gradient({
          type: "linear",
          coords: { x1: 0, y1: 0, x2, y2 },
          colorStops: colors.map((color, i) => ({
            offset: i / (colors.length - 1),
            color,
          })),
        });
        canvas.backgroundColor = gradient;
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
        canvas.backgroundColor = "#ffffff";
        canvas.requestRenderAll();
        historyRef.current?.clear();
      },
      selectAll,
      getSelectedObject: () => {
        return fabricRef.current?.getActiveObject() ?? null;
      },
    }));

    /* ── Drop handler: accept layouts and images dragged from the sidebar ── */
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }, []);

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

        // Convert screen coords to canvas coords
        const canvasEl = canvas.getElement();
        const rect = canvasEl.getBoundingClientRect();
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const z = canvas.getZoom();
        const canvasX = (e.clientX - rect.left - vpt[4]) / z;
        const canvasY = (e.clientY - rect.top - vpt[5]) / z;
        const dropPoint = new fabric.Point(canvasX, canvasY);

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

        // Check if drop is over a grid cell or a clip frame
        // Reverse so we check top-most objects first
        const dropTarget = canvas.getObjects().slice().reverse().find((obj) => {
          const objName = (obj as unknown as { name?: string }).name;
          const isGrid = objName === "grid-placeholder" || objName === "grid-image";
          const isFrame = (obj as any).isImageFrame === true;
          if (!isGrid && !isFrame) return false;
          return obj.containsPoint(dropPoint);
        });

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
        className="flex-1 flex items-center justify-center bg-gray-100 overflow-hidden"
        style={{ position: "relative" }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Canvas wrapper with shadow to simulate a page */}
        <div
          className="shadow-2xl relative"
          style={{
            width: width * zoom,
            height: height * zoom,
            transform: `scale(1)`,
            transformOrigin: "center center",
          }}
        >
          <canvas ref={canvasRef} />
        </div>
        {/* Right-click Context Menu */}
        {contextMenu && (
          <div
            className="fixed z-[200] bg-white rounded-lg shadow-xl border border-gray-200 py-2 w-48"
            style={{ top: contextMenu.y, left: contextMenu.x }}
            onMouseLeave={() => setContextMenu(null)}
          >
            <button
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              onClick={() => {
                const canvas = fabricRef.current;
                if (!canvas) return;

                // Discard context menu
                setContextMenu(null);

                // Active object for visual feedback
                canvas.setActiveObject(contextMenu.target);

                // Start crop mode using our ref
                if (startCropModeRef.current) {
                  startCropModeRef.current(contextMenu.target);
                }
              }}
            >
              <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16h16M4 20h16M4 8h16M4 4h16" />
              </svg>
              Recadrer l'image
            </button>
          </div>
        )}
      </div>
    );
  });

CanvasEditor.displayName = "CanvasEditor";
export default CanvasEditor;
