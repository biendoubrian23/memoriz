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
};

const CanvasEditor = forwardRef<CanvasEditorHandle, Props>(
  ({ width, height, onSelectionChange, onObjectModified, onCanvasReady }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const historyRef = useRef<HistoryManager | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [zoom, setZoomState] = useState(1);
    const [isPanning, setIsPanning] = useState(false);
    const panStart = useRef<{ x: number; y: number } | null>(null);

    /* ── Initialize canvas ── */
    useEffect(() => {
      if (!canvasRef.current) return;

      // Load all Google Fonts
      loadAllFonts();

      const canvas = createFabricCanvas(canvasRef.current, width, height);
      fabricRef.current = canvas;

      // Enable snapping
      enableSnapping(canvas);

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

        const delta = e.deltaY;
        let newZoom = canvas.getZoom() * (1 - delta / 500);
        newZoom = Math.max(0.1, Math.min(5, newZoom));

        const point = new fabric.Point(e.offsetX, e.offsetY);
        canvas.zoomToPoint(point, newZoom);
        setZoomState(newZoom);
      };

      canvas.on("mouse:wheel", handleWheel);
      return () => {
        canvas.off("mouse:wheel", handleWheel);
      };
    }, []);

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
        const z = Math.min(canvas.getZoom() * 1.2, 5);
        canvas.setZoom(z);
        setZoomState(z);
      },
      zoomOut: () => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        const z = Math.max(canvas.getZoom() / 1.2, 0.1);
        canvas.setZoom(z);
        setZoomState(z);
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
      },
      setZoom: (z: number) => {
        const canvas = fabricRef.current;
        if (!canvas) return;
        canvas.setZoom(z);
        setZoomState(z);
      },
      getZoom: () => zoom,
      toJSON: () => {
        const canvas = fabricRef.current;
        if (!canvas) return "{}";
        return JSON.stringify(canvas.toJSON());
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
        await canvas.loadFromJSON(json);
        canvas.requestRenderAll();
        historyRef.current?.clear();
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

    /* ── Drop handler: accept images dragged from the sidebar ── */
    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    }, []);

    const handleDrop = useCallback(
      async (e: React.DragEvent) => {
        e.preventDefault();
        // Only handle memoriz image drops (not file drops)
        const url =
          e.dataTransfer.getData("application/x-memoriz-image") ||
          e.dataTransfer.getData("text/plain");
        if (!url || !url.startsWith("http")) return;

        const canvas = fabricRef.current;
        if (!canvas) return;

        // Convert screen coords to canvas coords
        const canvasEl = canvas.getElement();
        const rect = canvasEl.getBoundingClientRect();
        const vpt = canvas.viewportTransform || [1, 0, 0, 1, 0, 0];
        const z = canvas.getZoom();
        const canvasX = (e.clientX - rect.left - vpt[4]) / z;
        const canvasY = (e.clientY - rect.top - vpt[5]) / z;

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
      [onObjectModified]
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
      </div>
    );
  }
);

CanvasEditor.displayName = "CanvasEditor";
export default CanvasEditor;
