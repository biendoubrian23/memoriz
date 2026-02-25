"use client";

/* ─────────────────────────────────────────────────────────────
   LayersPanel — Shows stacking order of canvas objects
   Top of the list = front (on top), bottom = back (behind)
   Drag to reorder, click to select, eye to toggle visibility
   ───────────────────────────────────────────────────────────── */

import { useState, useCallback, useEffect, useRef } from "react";
import * as fabric from "fabric";
import {
  Eye,
  EyeOff,
  Type,
  ImageIcon,
  Square,
  Circle,
  Triangle,
  Star,
  Layers,
  GripVertical,
  Lock,
  Unlock,
} from "lucide-react";
import type { CanvasEditorHandle } from "./CanvasEditor";

type Props = {
  editorRef: React.RefObject<CanvasEditorHandle | null>;
  selectedObject: fabric.FabricObject | null;
  /** Incremented when objects change so the panel refreshes */
  refreshKey: number;
};

type LayerItem = {
  object: fabric.FabricObject;
  name: string;
  type: string;
  visible: boolean;
  locked: boolean;
};

/** Infer a human-readable name for a Fabric object */
function getObjectLabel(obj: fabric.FabricObject): { name: string; type: string } {
  const customName = (obj as fabric.FabricObject & { name?: string }).name;

  if (obj instanceof fabric.Textbox || obj instanceof fabric.IText || obj instanceof fabric.FabricText) {
    const text = (obj as fabric.Textbox).text ?? "";
    return {
      name: customName || text.slice(0, 24) || "Texte",
      type: "text",
    };
  }
  if (obj instanceof fabric.FabricImage) {
    return { name: customName || "Image", type: "image" };
  }
  if (obj instanceof fabric.Group) {
    return { name: customName || "Groupe", type: "group" };
  }
  if (obj instanceof fabric.Circle) {
    return { name: customName || "Cercle", type: "circle" };
  }
  if (obj instanceof fabric.Triangle) {
    return { name: customName || "Triangle", type: "triangle" };
  }
  if (obj instanceof fabric.Rect) {
    return { name: customName || "Rectangle", type: "rect" };
  }
  if (obj instanceof fabric.Polygon) {
    return { name: customName || "Polygone", type: "polygon" };
  }
  if (obj instanceof fabric.Path) {
    return { name: customName || "Forme", type: "path" };
  }
  return { name: customName || "Objet", type: "object" };
}

/** Icon for each layer type */
function LayerIcon({ type }: { type: string }) {
  const cls = "w-3.5 h-3.5";
  switch (type) {
    case "text":
      return <Type className={cls} />;
    case "image":
      return <ImageIcon className={cls} />;
    case "circle":
      return <Circle className={cls} />;
    case "triangle":
      return <Triangle className={cls} />;
    case "rect":
      return <Square className={cls} />;
    case "polygon":
      return <Star className={cls} />;
    default:
      return <Square className={cls} />;
  }
}

export default function LayersPanel({ editorRef, selectedObject, refreshKey }: Props) {
  const [layers, setLayers] = useState<LayerItem[]>([]);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dropIdx, setDropIdx] = useState<number | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Rebuild layer list from canvas objects (reversed: top layer first)
  const refreshLayers = useCallback(() => {
    const objects = editorRef.current?.getObjects() ?? [];
    const items: LayerItem[] = objects
      .map((obj) => {
        const { name, type } = getObjectLabel(obj);
        return {
          object: obj,
          name,
          type,
          visible: obj.visible !== false,
          locked: !!obj.lockMovementX,
        };
      })
      .reverse(); // top-most first
    setLayers(items);
  }, [editorRef]);

  // Refresh when refreshKey changes (objects added/removed/modified)
  useEffect(() => {
    refreshLayers();
  }, [refreshLayers, refreshKey]);

  // Select object on canvas when clicking a layer
  const handleSelect = useCallback(
    (obj: fabric.FabricObject) => {
      const canvas = editorRef.current?.getCanvas();
      if (!canvas) return;
      canvas.setActiveObject(obj);
      canvas.requestRenderAll();
    },
    [editorRef]
  );

  // Toggle visibility
  const toggleVisibility = useCallback(
    (obj: fabric.FabricObject) => {
      obj.visible = !obj.visible;
      editorRef.current?.getCanvas()?.requestRenderAll();
      refreshLayers();
    },
    [editorRef, refreshLayers]
  );

  // Toggle lock
  const toggleLock = useCallback(
    (obj: fabric.FabricObject) => {
      const locked = !obj.lockMovementX;
      obj.set({
        lockMovementX: locked,
        lockMovementY: locked,
        lockRotation: locked,
        lockScalingX: locked,
        lockScalingY: locked,
        selectable: !locked,
        evented: !locked,
      });
      editorRef.current?.getCanvas()?.requestRenderAll();
      refreshLayers();
    },
    [editorRef, refreshLayers]
  );

  // Drag & drop reorder
  const handleDragStart = useCallback((idx: number) => {
    setDragIdx(idx);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, idx: number) => {
    e.preventDefault();
    setDropIdx(idx);
  }, []);

  const handleDrop = useCallback(
    (targetIdx: number) => {
      if (dragIdx === null || dragIdx === targetIdx) {
        setDragIdx(null);
        setDropIdx(null);
        return;
      }
      const canvas = editorRef.current?.getCanvas();
      if (!canvas) return;

      // Layers are reversed: index 0 = top-most object
      // Convert to canvas index: canvas objects go from bottom(0) to top(n-1)
      const objects = canvas.getObjects().filter((o) => !o.excludeFromExport);
      const totalCount = objects.length;
      const fromCanvasIdx = totalCount - 1 - dragIdx;
      const toCanvasIdx = totalCount - 1 - targetIdx;

      const obj = objects[fromCanvasIdx];
      if (!obj) return;

      // Move object to target z-index
      canvas.remove(obj);
      const allObjects = canvas.getObjects();
      // Adjust for the removal
      const insertAt = Math.max(0, Math.min(allObjects.length, toCanvasIdx));
      canvas.insertAt(insertAt, obj);
      canvas.requestRenderAll();
      editorRef.current?.getHistory()?.saveState();
      refreshLayers();

      setDragIdx(null);
      setDropIdx(null);
    },
    [dragIdx, editorRef, refreshLayers]
  );

  if (layers.length === 0) return null;

  return (
    <div ref={panelRef} className="border-t border-gray-200 bg-white">
      {/* Header */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase tracking-wider text-gray-500 hover:bg-gray-50"
      >
        <Layers className="w-3.5 h-3.5" />
        <span>Calques ({layers.length})</span>
        <svg
          className={`w-3 h-3 ml-auto transition-transform ${collapsed ? "-rotate-90" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Layer list */}
      {!collapsed && (
        <div className="max-h-52 overflow-y-auto">
          {layers.map((layer, idx) => {
            const isSelected = selectedObject === layer.object;
            const isDragOver = dropIdx === idx && dragIdx !== idx;

            return (
              <div
                key={idx}
                draggable
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={() => handleDrop(idx)}
                onDragEnd={() => {
                  setDragIdx(null);
                  setDropIdx(null);
                }}
                onClick={() => handleSelect(layer.object)}
                className={`
                  flex items-center gap-1.5 px-2 py-1.5 cursor-pointer text-xs border-l-2 transition-all
                  ${isSelected ? "border-purple-500 bg-purple-50 text-purple-800" : "border-transparent hover:bg-gray-50 text-gray-600"}
                  ${isDragOver ? "border-t-2 border-t-purple-400" : ""}
                  ${dragIdx === idx ? "opacity-40" : ""}
                `}
              >
                {/* Drag handle */}
                <GripVertical className="w-3 h-3 text-gray-300 cursor-grab shrink-0" />

                {/* Type icon */}
                <div className={`shrink-0 ${isSelected ? "text-purple-600" : "text-gray-400"}`}>
                  <LayerIcon type={layer.type} />
                </div>

                {/* Name */}
                <span className="truncate flex-1 min-w-0 select-none">
                  {layer.name}
                </span>

                {/* Lock toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLock(layer.object);
                  }}
                  className={`shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 ${layer.locked ? "text-amber-500" : "text-gray-300 opacity-0 group-hover:opacity-100"}`}
                  title={layer.locked ? "Déverrouiller" : "Verrouiller"}
                >
                  {layer.locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                </button>

                {/* Visibility toggle */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVisibility(layer.object);
                  }}
                  className={`shrink-0 w-5 h-5 flex items-center justify-center rounded hover:bg-gray-200 ${!layer.visible ? "text-red-400" : "text-gray-400"}`}
                  title={layer.visible ? "Masquer" : "Afficher"}
                >
                  {layer.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
