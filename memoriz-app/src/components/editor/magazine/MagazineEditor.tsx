"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
  X,
  Type,
  ImageIcon,
  Square,
  Minus,
  Smile,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Save,
  ChevronLeft,
} from "lucide-react";
import type { FreeformElement, UserPhoto } from "@/lib/types/editor";
import { getGoogleFontsUrl } from "@/lib/magazine-templates";
import MagazineCanvas from "./MagazineCanvas";
import PropertyPanel from "./PropertyPanel";

/* ─── Props ─── */
type Props = {
  elements: FreeformElement[];
  photos: UserPhoto[];
  backgroundColor?: string;
  backgroundGradient?: string;
  canvasAspect?: number;
  onSave: (elements: FreeformElement[]) => Promise<void>;
  onClose: () => void;
};

/* ═══════════════════════════════════════════════════════════════
   MagazineEditor — Full-screen premium editor
   ═══════════════════════════════════════════════════════════════ */
export default function MagazineEditor({
  elements: initialElements,
  photos,
  backgroundColor,
  backgroundGradient,
  canvasAspect,
  onSave,
  onClose,
}: Props) {
  const [elements, setElements] = useState<FreeformElement[]>(initialElements);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [saving, setSaving] = useState(false);
  const [undoStack, setUndoStack] = useState<FreeformElement[][]>([]);
  const [redoStack, setRedoStack] = useState<FreeformElement[][]>([]);
  const [showPhotos, setShowPhotos] = useState(false);
  const replaceImageId = useRef<string | null>(null);

  // Sync when parent provides updated elements (e.g. after DB reload)
  useEffect(() => {
    if (initialElements.length > 0) {
      setElements(initialElements);
    }
  }, [initialElements]);

  // Load Google Fonts
  useEffect(() => {
    const id = "memoriz-magazine-fonts";
    if (!document.getElementById(id)) {
      const link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      link.href = getGoogleFontsUrl();
      document.head.appendChild(link);
    }
  }, []);

  // Push to undo stack before changes
  const pushUndo = useCallback(() => {
    setUndoStack((prev) => [...prev.slice(-30), elements]);
    setRedoStack([]);
  }, [elements]);

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    setRedoStack((prev) => [...prev, elements]);
    setElements(undoStack[undoStack.length - 1]);
    setUndoStack((prev) => prev.slice(0, -1));
  }, [undoStack, elements]);

  const redo = useCallback(() => {
    if (redoStack.length === 0) return;
    setUndoStack((prev) => [...prev, elements]);
    setElements(redoStack[redoStack.length - 1]);
    setRedoStack((prev) => prev.slice(0, -1));
  }, [redoStack, elements]);

  // Update element
  const updateElement = useCallback(
    (id: string, updates: Partial<FreeformElement>) => {
      pushUndo();
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, ...updates } : el))
      );
    },
    [pushUndo]
  );

  // Update text content
  const updateTextContent = useCallback(
    (id: string, content: string) => {
      pushUndo();
      setElements((prev) =>
        prev.map((el) => (el.id === id ? { ...el, content } : el))
      );
    },
    [pushUndo]
  );

  // Delete element
  const deleteElement = useCallback(
    (id: string) => {
      pushUndo();
      setElements((prev) => prev.filter((el) => el.id !== id));
      if (selectedId === id) setSelectedId(null);
    },
    [pushUndo, selectedId]
  );

  // Duplicate element
  const duplicateElement = useCallback(() => {
    if (!selectedId) return;
    const src = elements.find((el) => el.id === selectedId);
    if (!src) return;
    pushUndo();
    const newId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const dup: FreeformElement = {
      ...src,
      id: newId,
      x: src.x + 3,
      y: src.y + 3,
      zIndex: Math.max(...elements.map((e) => e.zIndex)) + 1,
    };
    setElements((prev) => [...prev, dup]);
    setSelectedId(newId);
  }, [selectedId, elements, pushUndo]);

  // Add new elements
  const addText = useCallback(() => {
    pushUndo();
    const newId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const maxZ = elements.length > 0 ? Math.max(...elements.map((e) => e.zIndex)) : 0;
    const newEl: FreeformElement = {
      id: newId, type: "text", x: 20, y: 40, width: 60, height: 10,
      rotation: 0, zIndex: maxZ + 1, opacity: 1,
      content: "Votre texte ici", fontFamily: "Montserrat", fontSize: 3.5,
      fontWeight: "600", textColor: "#ffffff", textAlign: "center", lineHeight: 1.2,
    };
    setElements((prev) => [...prev, newEl]);
    setSelectedId(newId);
  }, [pushUndo, elements]);

  const addShape = useCallback(
    (shapeType: "rectangle" | "circle" | "line") => {
      pushUndo();
      const newId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const maxZ = elements.length > 0 ? Math.max(...elements.map((e) => e.zIndex)) : 0;
      const newEl: FreeformElement = {
        id: newId, type: "shape",
        x: 25, y: 35, width: shapeType === "line" ? 50 : 30, height: shapeType === "line" ? 1 : 20,
        rotation: 0, zIndex: maxZ + 1, opacity: 1,
        shapeType, fillColor: shapeType === "line" ? "transparent" : "#ffffff",
        strokeColor: "#333333", strokeWidth: 2,
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newId);
    },
    [pushUndo, elements]
  );

  const addSticker = useCallback(
    (emoji: string) => {
      pushUndo();
      const newId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const maxZ = elements.length > 0 ? Math.max(...elements.map((e) => e.zIndex)) : 0;
      const newEl: FreeformElement = {
        id: newId, type: "sticker", x: 40, y: 40, width: 10, height: 8,
        rotation: 0, zIndex: maxZ + 1, opacity: 1, content: emoji,
        fontSize: 5,
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newId);
    },
    [pushUndo, elements]
  );

  const addImageFromPhoto = useCallback(
    (photo: UserPhoto) => {
      const imageUrl = photo.publicUrl || photo.file_path;
      if (replaceImageId.current) {
        // Replace existing image
        updateElement(replaceImageId.current, { imageUrl, content: imageUrl });
        replaceImageId.current = null;
        setShowPhotos(false);
        return;
      }
      pushUndo();
      const newId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const maxZ = elements.length > 0 ? Math.max(...elements.map((e) => e.zIndex)) : 0;
      const newEl: FreeformElement = {
        id: newId, type: "image", x: 15, y: 15, width: 40, height: 35,
        rotation: 0, zIndex: maxZ + 1, opacity: 1,
        imageUrl, objectFit: "cover",
      };
      setElements((prev) => [...prev, newEl]);
      setSelectedId(newId);
      setShowPhotos(false);
    },
    [pushUndo, elements, updateElement]
  );

  // Handle image replacement trigger from PropertyPanel
  const handleReplaceImage = useCallback(() => {
    if (selectedId) {
      replaceImageId.current = selectedId;
      setShowPhotos(true);
    }
  }, [selectedId]);

  // Save
  const handleSave = useCallback(async () => {
    setSaving(true);
    await onSave(elements);
    setSaving(false);
  }, [elements, onSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z") { e.preventDefault(); undo(); }
        if (e.key === "y") { e.preventDefault(); redo(); }
        if (e.key === "s") { e.preventDefault(); handleSave(); }
      }
      if (e.key === "Escape") {
        if (editingTextId) setEditingTextId(null);
        else if (selectedId) setSelectedId(null);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, handleSave, editingTextId, selectedId]);

  const selectedElement = useMemo(
    () => elements.find((el) => el.id === selectedId) ?? null,
    [elements, selectedId]
  );

  const maxZIndex = useMemo(
    () => (elements.length > 0 ? Math.max(...elements.map((e) => e.zIndex)) : 0),
    [elements]
  );

  const EMOJIS = ["⭐", "❤️", "🌟", "✨", "🔥", "💖", "🎉", "🌸", "🦋", "💎", "🌺", "🎀", "☀️", "🌙", "💫"];

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 flex flex-col">
      {/* ── Top bar ── */}
      <header className="flex items-center gap-3 px-4 py-2.5 bg-gray-800 border-b border-gray-700 shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-1.5 text-gray-300 hover:text-white transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="flex-1" />

        {/* Undo / Redo */}
        <button onClick={undo} disabled={undoStack.length === 0}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 transition-colors">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={redo} disabled={redoStack.length === 0}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-30 transition-colors">
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        {/* Zoom */}
        <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-xs text-gray-400 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors">
          <ZoomIn className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-gray-600 mx-1" />

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          <Save className="w-3.5 h-3.5" />
          {saving ? "Sauvegarde..." : "Sauvegarder"}
        </button>

        <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors ml-2">
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* ── Main area ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Left toolbar ── */}
        <div className="w-14 bg-gray-800 border-r border-gray-700 flex flex-col items-center py-3 gap-2 shrink-0">
          <ToolBtn icon={<Type className="w-5 h-5" />} label="Texte" onClick={addText} />
          <ToolBtn icon={<ImageIcon className="w-5 h-5" />} label="Photo" onClick={() => { replaceImageId.current = null; setShowPhotos(!showPhotos); }} />
          <ToolBtn icon={<Square className="w-5 h-5" />} label="Forme" onClick={() => addShape("rectangle")} />
          <ToolBtn icon={<div className="w-5 h-5 flex items-center justify-center"><div className="w-5 h-0.5 bg-current rounded" /></div>} label="Ligne" onClick={() => addShape("line")} />
          <ToolBtn icon={<div className="w-5 h-5 rounded-full border-2 border-current" />} label="Cercle" onClick={() => addShape("circle")} />
          <div className="w-8 h-px bg-gray-600 my-1" />
          <ToolBtn icon={<Smile className="w-5 h-5" />} label="Sticker" onClick={() => addSticker("⭐")} />
        </div>

        {/* ── Photo piker overlay ── */}
        {showPhotos && (
          <div className="w-64 bg-gray-800 border-r border-gray-700 overflow-y-auto p-3 shrink-0">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Photos</p>
              <button onClick={() => setShowPhotos(false)} className="text-gray-500 hover:text-gray-300">
                <X className="w-4 h-4" />
              </button>
            </div>
            {photos.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-4">Aucune photo uploadée</p>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {photos.map((photo) => (
                  <button
                    key={photo.id}
                    onClick={() => addImageFromPhoto(photo)}
                    className="aspect-square rounded-lg overflow-hidden ring-1 ring-gray-600 hover:ring-primary transition-all"
                  >
                    <img
                      src={photo.publicUrl || ""}
                      alt={photo.file_name}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
            {/* Sticker grid */}
            <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mt-4 mb-2">Stickers</p>
            <div className="grid grid-cols-5 gap-1">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => { addSticker(emoji); setShowPhotos(false); }}
                  className="text-xl p-1.5 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Canvas area ── */}
        <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-gray-900/80">
          <div
            style={{
              width: `${Math.min(600, 600 * zoom)}px`,
              transition: "width 0.2s ease",
            }}
          >
            <MagazineCanvas
              elements={elements}
              selectedId={selectedId}
              editingTextId={editingTextId}
              onSelect={setSelectedId}
              onStartEditText={(id) => setEditingTextId(id)}
              onStopEditText={() => setEditingTextId(null)}
              onUpdateElement={updateElement}
              onUpdateTextContent={updateTextContent}
              onDeleteElement={deleteElement}
              backgroundColor={backgroundColor}
              backgroundGradient={backgroundGradient}
              canvasAspect={canvasAspect}
              interactive={true}
              className="rounded-lg shadow-2xl"
            />
          </div>
        </div>

        {/* ── Right panel (properties) ── */}
        <div className="w-72 bg-white border-l border-gray-200 shrink-0 overflow-hidden flex flex-col">
          {selectedElement ? (
            <div className="flex-1 overflow-y-auto p-4">
              <PropertyPanel
                element={selectedElement}
                maxZIndex={maxZIndex}
                onUpdate={(updates) => updateElement(selectedElement.id, updates)}
                onDelete={() => deleteElement(selectedElement.id)}
                onDuplicate={duplicateElement}
                onReplaceImage={selectedElement.type === "image" ? handleReplaceImage : undefined}
              />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Type className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-400 mb-1">
                Sélectionnez un élément
              </p>
              <p className="text-xs text-gray-300 leading-relaxed">
                Cliquez sur un texte, une photo ou une forme pour modifier ses propriétés.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Toolbar button ─── */
function ToolBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group relative w-10 h-10 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
      title={label}
    >
      {icon}
      <span className="absolute left-12 px-2 py-1 bg-gray-700 text-white text-[10px] font-medium rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
        {label}
      </span>
    </button>
  );
}
