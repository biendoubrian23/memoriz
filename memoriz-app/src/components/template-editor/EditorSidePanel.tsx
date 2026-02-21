"use client";

/* ─────────────────────────────────────────────────────────────
   EditorSidePanel — Left sidebar (Text, Shapes, Images, Upload)
   Canva-style with vertical icon tabs + content panel
   ───────────────────────────────────────────────────────────── */

import { useState, useRef, useCallback, useEffect } from "react";
import * as fabric from "fabric";
import {
  Type,
  Shapes,
  ImageIcon,
  Upload,
  Frame,
  Palette,
  Search,
  Scissors,
  Grid3X3,
  Loader2,
  Trash2,
} from "lucide-react";
import type { CanvasEditorHandle } from "./CanvasEditor";
import {
  SHAPE_PRESETS,
  TEXT_PRESETS,
  FRAME_PRESETS,
  createTextFromPreset,
  createFrame,
} from "@/lib/template-editor/element-presets";
import { GOOGLE_FONTS, loadFont } from "@/lib/template-editor/font-loader";
import {
  removeImageBackground,
  dataURLToBlob,
  type RemovalProgress,
} from "@/lib/template-editor/bg-removal";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";

type SideTab = "text" | "shapes" | "images" | "upload" | "frames" | "background" | "elements";

type Props = {
  editorRef: React.RefObject<CanvasEditorHandle | null>;
};

const SIDE_TABS: { key: SideTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "text", label: "Texte", icon: Type },
  { key: "shapes", label: "Formes", icon: Shapes },
  { key: "elements", label: "Éléments", icon: Grid3X3 },
  { key: "images", label: "Photos", icon: ImageIcon },
  { key: "upload", label: "Importer", icon: Upload },
  { key: "frames", label: "Cadres", icon: Frame },
  { key: "background", label: "Fond", icon: Palette },
];

const VALID_SIDE_TABS: SideTab[] = ["text", "shapes", "elements", "images", "upload", "frames", "background"];

export default function EditorSidePanel({ editorRef }: Props) {
  const [activeTab, setActiveTabRaw] = useState<SideTab>(() => {
    if (typeof window === "undefined") return "text";
    const url = new URL(window.location.href);
    const saved = url.searchParams.get("tplTab") as SideTab | null;
    return saved && VALID_SIDE_TABS.includes(saved) ? saved : "text";
  });
  const [isOpen, setIsOpen] = useState(true);

  // Wrapper that also persists the tab in the URL
  const setActiveTab = useCallback((tab: SideTab) => {
    setActiveTabRaw(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tplTab", tab);
    window.history.replaceState({}, "", url.toString());
  }, []);

  return (
    <div className="flex h-full shrink-0">
      {/* Icon tabs */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1">
        {SIDE_TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              if (activeTab === key && isOpen) {
                setIsOpen(false);
              } else {
                setActiveTab(key);
                setIsOpen(true);
              }
            }}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-colors text-[10px] font-medium ${
              activeTab === key && isOpen
                ? "bg-purple-50 text-purple-700"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
            title={label}
          >
            <Icon className="w-5 h-5" />
            <span className="leading-none">{label}</span>
          </button>
        ))}
      </div>

      {/* Content panel */}
      {isOpen && (
        <div className="w-72 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            {activeTab === "text" && <TextPanel editorRef={editorRef} />}
            {activeTab === "shapes" && <ShapesPanel editorRef={editorRef} />}
            {activeTab === "elements" && <ElementsPanel editorRef={editorRef} />}
            {activeTab === "images" && <ImagesPanel editorRef={editorRef} />}
            {activeTab === "upload" && <UploadPanel editorRef={editorRef} />}
            {activeTab === "frames" && <FramesPanel editorRef={editorRef} />}
            {activeTab === "background" && <BackgroundPanel editorRef={editorRef} />}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ TEXT PANEL ═══════════════════ */
function TextPanel({ editorRef }: { editorRef: React.RefObject<CanvasEditorHandle | null> }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        Styles de texte
      </h3>

      {/* Quick add */}
      <button
        onClick={() => {
          const canvas = editorRef.current?.getCanvas();
          if (!canvas) return;
          const text = new fabric.Textbox("Zone de texte", {
            left: canvas.getWidth() / 2 - 100,
            top: canvas.getHeight() / 2 - 20,
            width: 200,
            fontSize: 20,
            fontFamily: "Poppins",
            fill: "#111827",
            textAlign: "center",
            editable: true,
            name: "Texte",
          });
          editorRef.current?.addObject(text);
        }}
        className="w-full py-3 bg-purple-600 text-white rounded-xl text-sm font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
      >
        <Type className="w-4 h-4" />
        Ajouter une zone de texte
      </button>

      <div className="space-y-2">
        {TEXT_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              const canvas = editorRef.current?.getCanvas();
              if (!canvas) return;
              loadFont(preset.fontFamily);
              const text = createTextFromPreset(canvas, preset);
              editorRef.current?.addObject(text);
            }}
            className="w-full p-3 border-2 border-dashed border-gray-200 rounded-xl text-left hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
          >
            <span
              className="block truncate group-hover:text-purple-700 transition-colors"
              style={{
                fontFamily: preset.fontFamily,
                fontSize: Math.min(preset.fontSize, 28),
                fontWeight: preset.fontWeight,
                color: preset.fill,
              }}
            >
              {preset.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ SHAPES PANEL ═══════════════════ */
function ShapesPanel({ editorRef }: { editorRef: React.RefObject<CanvasEditorHandle | null> }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        Formes
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {SHAPE_PRESETS.map((shape) => (
          <button
            key={shape.id}
            onClick={() => {
              const canvas = editorRef.current?.getCanvas();
              if (!canvas) return;
              const obj = shape.create(canvas);
              editorRef.current?.addObject(obj);
            }}
            className="aspect-square border-2 border-gray-100 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform">
              {shape.icon}
            </span>
            <span className="text-[10px] text-gray-500 group-hover:text-purple-600">
              {shape.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ ELEMENTS PANEL ═══════════════════ */
function ElementsPanel({ editorRef }: { editorRef: React.RefObject<CanvasEditorHandle | null> }) {
  const [searchQuery, setSearchQuery] = useState("");

  // SVG decorative elements  
  const DECORATIVE_ELEMENTS = [
    { id: "divider-1", name: "Séparateur", svg: "M0,25 L200,25", type: "line" },
    { id: "arrow-right", name: "Flèche →", emoji: "→" },
    { id: "heart", name: "Cœur", emoji: "❤️" },
    { id: "star", name: "Étoile", emoji: "⭐" },
    { id: "music", name: "Musique", emoji: "🎵" },
    { id: "camera", name: "Appareil photo", emoji: "📷" },
    { id: "sun", name: "Soleil", emoji: "☀️" },
    { id: "moon", name: "Lune", emoji: "🌙" },
    { id: "flower", name: "Fleur", emoji: "🌸" },
    { id: "leaf", name: "Feuille", emoji: "🍃" },
    { id: "sparkle", name: "Étincelle", emoji: "✨" },
    { id: "crown", name: "Couronne", emoji: "👑" },
    { id: "ribbon", name: "Ruban", emoji: "🎀" },
    { id: "gift", name: "Cadeau", emoji: "🎁" },
    { id: "cake", name: "Gâteau", emoji: "🎂" },
    { id: "balloon", name: "Ballon", emoji: "🎈" },
    { id: "confetti", name: "Confetti", emoji: "🎉" },
    { id: "diamond", name: "Diamant", emoji: "💎" },
    { id: "fire", name: "Feu", emoji: "🔥" },
    { id: "rainbow", name: "Arc-en-ciel", emoji: "🌈" },
    { id: "plane", name: "Avion", emoji: "✈️" },
    { id: "compass", name: "Boussole", emoji: "🧭" },
    { id: "map", name: "Carte", emoji: "🗺️" },
    { id: "mountain", name: "Montagne", emoji: "⛰️" },
    { id: "palm", name: "Palmier", emoji: "🌴" },
    { id: "umbrella", name: "Parapluie", emoji: "☂️" },
    { id: "baby", name: "Bébé", emoji: "👶" },
    { id: "wedding", name: "Alliance", emoji: "💍" },
    { id: "rose", name: "Rose", emoji: "🌹" },
    { id: "butterfly", name: "Papillon", emoji: "🦋" },
  ];

  const filtered = searchQuery
    ? DECORATIVE_ELEMENTS.filter((el) =>
        el.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : DECORATIVE_ELEMENTS;

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        Éléments décoratifs
      </h3>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher un élément..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-400"
        />
      </div>

      <div className="grid grid-cols-4 gap-2">
        {filtered.map((el) => (
          <button
            key={el.id}
            onClick={() => {
              const canvas = editorRef.current?.getCanvas();
              if (!canvas) return;
              // Add as large text object (emoji) 
              const text = new fabric.Textbox(el.emoji || "—", {
                left: canvas.getWidth() / 2 - 30,
                top: canvas.getHeight() / 2 - 30,
                width: 60,
                fontSize: 48,
                textAlign: "center",
                name: el.name,
                editable: false,
              });
              editorRef.current?.addObject(text);
            }}
            className="aspect-square border border-gray-100 rounded-lg flex flex-col items-center justify-center gap-0.5 hover:border-purple-400 hover:bg-purple-50/50 transition-all"
            title={el.name}
          >
            <span className="text-2xl">{el.emoji || "—"}</span>
            <span className="text-[8px] text-gray-400 truncate max-w-full px-1">
              {el.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ IMAGES PANEL (Unsplash) ═══════════════════ */
function ImagesPanel({ editorRef }: { editorRef: React.RefObject<CanvasEditorHandle | null> }) {
  const [query, setQuery] = useState("");
  const [images, setImages] = useState<{ url: string; thumb: string; alt: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Free stock images (curated placeholders from Unsplash)
  const STOCK_CATEGORIES = [
    { label: "Nature", query: "nature landscape" },
    { label: "Portraits", query: "portrait person" },
    { label: "Architecture", query: "architecture building" },
    { label: "Nourriture", query: "food" },
    { label: "Voyage", query: "travel" },
    { label: "Mode", query: "fashion" },
    { label: "Famille", query: "family" },
    { label: "Mariage", query: "wedding" },
    { label: "Bébé", query: "baby newborn" },
    { label: "Fleurs", query: "flowers" },
  ];

  const searchUnsplash = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      // Use Unsplash source (no API key needed for basic usage)
      const results = Array.from({ length: 12 }, (_, i) => ({
        url: `https://source.unsplash.com/800x600/?${encodeURIComponent(q)}&sig=${Date.now() + i}`,
        thumb: `https://source.unsplash.com/200x150/?${encodeURIComponent(q)}&sig=${Date.now() + i}`,
        alt: `${q} ${i + 1}`,
      }));
      setImages(results);
    } finally {
      setLoading(false);
    }
  }, []);

  const addImageToCanvas = useCallback(
    async (url: string) => {
      const canvas = editorRef.current?.getCanvas();
      if (!canvas) return;
      try {
        const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
        // Scale to fit within canvas
        const maxW = canvas.getWidth() * 0.6;
        const maxH = canvas.getHeight() * 0.6;
        const scale = Math.min(maxW / (img.width ?? 1), maxH / (img.height ?? 1));
        img.set({
          left: canvas.getWidth() / 2 - ((img.width ?? 0) * scale) / 2,
          top: canvas.getHeight() / 2 - ((img.height ?? 0) * scale) / 2,
          scaleX: scale,
          scaleY: scale,
          name: "Image",
        });
        editorRef.current?.addObject(img);
      } catch (err) {
        console.error("Failed to load image:", err);
      }
    },
    [editorRef]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        Photos & Images
      </h3>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Rechercher des photos..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && searchUnsplash(query)}
          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-purple-400"
        />
      </div>

      {/* Category chips */}
      <div className="flex flex-wrap gap-1.5">
        {STOCK_CATEGORIES.map((cat) => (
          <button
            key={cat.label}
            onClick={() => {
              setQuery(cat.query);
              searchUnsplash(cat.query);
            }}
            className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-medium hover:bg-purple-100 hover:text-purple-700 transition-colors"
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {images.map((img, i) => (
            <div
              key={i}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", img.url);
                e.dataTransfer.setData("application/x-memoriz-image", img.url);
                e.dataTransfer.effectAllowed = "copy";
              }}
              onClick={() => addImageToCanvas(img.url)}
              className="aspect-[4/3] rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-400 transition-all cursor-grab active:cursor-grabbing"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.thumb}
                alt={img.alt}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ UPLOAD PANEL ═══════════════════ */
function UploadPanel({ editorRef }: { editorRef: React.RefObject<CanvasEditorHandle | null> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const supabase = useRef(createClient()).current;

  // Persisted images from Supabase storage
  type StoredImage = { name: string; url: string };
  const [uploadedImages, setUploadedImages] = useState<StoredImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loadingImages, setLoadingImages] = useState(true);
  const [bgRemovalProgress, setBgRemovalProgress] = useState<RemovalProgress | null>(null);

  const storagePath = user ? `${user.id}/template-editor` : null;

  // Load existing images from Supabase on mount
  useEffect(() => {
    if (!storagePath) {
      setLoadingImages(false);
      return;
    }
    (async () => {
      try {
        const { data: files } = await supabase.storage
          .from("user-photos")
          .list(storagePath, { sortBy: { column: "created_at", order: "desc" } });

        if (files && files.length > 0) {
          const images: StoredImage[] = files
            .filter((f) => !f.id?.startsWith("."))
            .map((f) => {
              const { data: urlData } = supabase.storage
                .from("user-photos")
                .getPublicUrl(`${storagePath}/${f.name}`);
              return { name: f.name, url: urlData.publicUrl };
            });
          setUploadedImages(images);
        }
      } catch (err) {
        console.error("Failed to load images:", err);
      } finally {
        setLoadingImages(false);
      }
    })();
  }, [storagePath, supabase]);

  // Upload files to Supabase storage — does NOT add to canvas
  const handleFileUpload = useCallback(
    async (files: FileList | null) => {
      if (!files || !storagePath) return;
      setUploading(true);

      const newImages: StoredImage[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith("image/")) continue;

        const fileName = `${Date.now()}_${i}_${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
        const filePath = `${storagePath}/${fileName}`;

        const { error } = await supabase.storage
          .from("user-photos")
          .upload(filePath, file, { contentType: file.type, upsert: false });

        if (error) {
          console.error("Upload error:", error);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from("user-photos")
          .getPublicUrl(filePath);

        newImages.push({ name: fileName, url: urlData.publicUrl });
      }

      if (newImages.length > 0) {
        setUploadedImages((prev) => [...newImages, ...prev]);
      }
      setUploading(false);
    },
    [storagePath, supabase]
  );

  // Delete a photo from Supabase storage
  const handleDeleteImage = useCallback(
    async (name: string) => {
      if (!storagePath) return;
      const { error } = await supabase.storage
        .from("user-photos")
        .remove([`${storagePath}/${name}`]);
      if (!error) {
        setUploadedImages((prev) => prev.filter((img) => img.name !== name));
      }
    },
    [storagePath, supabase]
  );

  // Drag start — store the public URL so the canvas can load it
  const handleDragStart = useCallback((e: React.DragEvent, url: string) => {
    e.dataTransfer.setData("text/plain", url);
    e.dataTransfer.setData("application/x-memoriz-image", url);
    e.dataTransfer.effectAllowed = "copy";
  }, []);

  const handleBgRemoval = useCallback(async () => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas) return;
    const active = canvas.getActiveObject();
    if (!active || !(active instanceof fabric.FabricImage)) {
      alert("Sélectionnez d'abord une image sur le canvas");
      return;
    }

    try {
      const dataURL = active.toDataURL({ format: "png", multiplier: 1 });
      const blob = dataURLToBlob(dataURL);

      const result = await removeImageBackground(blob, setBgRemovalProgress);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const url = e.target?.result as string;
        const newImg = await fabric.FabricImage.fromURL(url);
        newImg.set({
          left: active.left,
          top: active.top,
          scaleX: active.scaleX,
          scaleY: active.scaleY,
          angle: active.angle,
          name: "Image détourée",
        });
        canvas.remove(active);
        canvas.add(newImg);
        canvas.setActiveObject(newImg);
        canvas.requestRenderAll();
        editorRef.current?.getHistory()?.saveState();
        setBgRemovalProgress(null);
      };
      reader.readAsDataURL(result);
    } catch {
      setBgRemovalProgress(null);
      alert("Erreur lors du détourage");
    }
  }, [editorRef]);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        Importer
      </h3>

      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          // Only handle file drops (not image drags from the gallery)
          if (e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
          }
        }}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/30 transition-all"
      >
        {uploading ? (
          <Loader2 className="w-8 h-8 mx-auto mb-2 text-purple-500 animate-spin" />
        ) : (
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        )}
        <p className="text-sm font-medium text-gray-600">
          {uploading ? "Envoi en cours…" : "Glissez-déposez ou cliquez"}
        </p>
        <p className="text-[11px] text-gray-400 mt-1">
          PNG, JPG, SVG (max 10 Mo)
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileUpload(e.target.files)}
          className="hidden"
        />
      </div>

      {/* Background removal */}
      <div className="border border-gray-200 rounded-xl p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Scissors className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-gray-700">Détourage IA</span>
        </div>
        <p className="text-[11px] text-gray-400">
          Sélectionnez une image sur le canvas puis cliquez pour supprimer le fond.
        </p>
        <button
          onClick={handleBgRemoval}
          disabled={!!bgRemovalProgress}
          className="w-full py-2 bg-purple-100 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-200 disabled:opacity-50 transition-colors"
        >
          {bgRemovalProgress
            ? `${bgRemovalProgress.message} (${Math.round(bgRemovalProgress.progress * 100)}%)`
            : "Supprimer le fond"}
        </button>
      </div>

      {/* Loading indicator */}
      {loadingImages && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
          <span className="ml-2 text-xs text-gray-400">Chargement…</span>
        </div>
      )}

      {/* Uploaded images gallery — drag to canvas */}
      {uploadedImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold uppercase text-gray-400">
            Images importées ({uploadedImages.length})
          </h4>
          <p className="text-[10px] text-gray-400">
            Glissez une image vers le canvas pour l&apos;ajouter
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {uploadedImages.map((img) => (
              <div
                key={img.name}
                className="relative group aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-purple-400 cursor-grab active:cursor-grabbing"
                draggable
                onDragStart={(e) => handleDragStart(e, img.url)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(img.name);
                  }}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Supprimer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════ FRAMES PANEL ═══════════════════ */
function FramesPanel({ editorRef }: { editorRef: React.RefObject<CanvasEditorHandle | null> }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        Cadres décoratifs
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {FRAME_PRESETS.map((frame) => (
          <button
            key={frame.id}
            onClick={() => {
              const canvas = editorRef.current?.getCanvas();
              if (!canvas) return;
              const obj = createFrame(canvas, frame);
              editorRef.current?.addObject(obj);
            }}
            className="aspect-[4/3] border-2 border-gray-100 rounded-xl flex items-center justify-center hover:border-purple-400 hover:bg-purple-50/50 transition-all group"
          >
            <div
              className="w-3/4 h-3/4"
              style={{
                border: `${frame.borderWidth}px solid ${frame.borderColor}`,
                borderRadius: frame.borderRadius,
              }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ BACKGROUND PANEL ═══════════════════ */
function BackgroundPanel({ editorRef }: { editorRef: React.RefObject<CanvasEditorHandle | null> }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const SOLID_COLORS = [
    "#FFFFFF", "#F8F9FA", "#F3F4F6", "#E5E7EB", "#D1D5DB",
    "#9CA3AF", "#6B7280", "#4B5563", "#374151", "#1F2937",
    "#111827", "#000000",
    "#FEF2F2", "#FEE2E2", "#FECACA", "#EF4444", "#DC2626", "#991B1B",
    "#FFF7ED", "#FFEDD5", "#FDBA74", "#F97316", "#EA580C", "#9A3412",
    "#FFFBEB", "#FEF3C7", "#FCD34D", "#EAB308", "#CA8A04", "#854D0E",
    "#F0FDF4", "#DCFCE7", "#86EFAC", "#22C55E", "#16A34A", "#166534",
    "#EFF6FF", "#DBEAFE", "#93C5FD", "#3B82F6", "#2563EB", "#1E40AF",
    "#F5F3FF", "#EDE9FE", "#C4B5FD", "#8B5CF6", "#7C3AED", "#5B21B6",
    "#FDF2F8", "#FCE7F3", "#F9A8D4", "#EC4899", "#DB2777", "#9D174D",
  ];

  const GRADIENT_PRESETS = [
    { colors: ["#667eea", "#764ba2"], label: "Violet" },
    { colors: ["#f093fb", "#f5576c"], label: "Rose" },
    { colors: ["#4facfe", "#00f2fe"], label: "Bleu" },
    { colors: ["#43e97b", "#38f9d7"], label: "Vert" },
    { colors: ["#fa709a", "#fee140"], label: "Coucher" },
    { colors: ["#a18cd1", "#fbc2eb"], label: "Lavande" },
    { colors: ["#ffecd2", "#fcb69f"], label: "Pêche" },
    { colors: ["#2b2d42", "#8d99ae", "#edf2f4"], label: "Charbon" },
    { colors: ["#0f0c29", "#302b63", "#24243e"], label: "Nuit" },
    { colors: ["#ee9ca7", "#ffdde1"], label: "Rose tendre" },
  ];

  return (
    <div className="space-y-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
        Arrière-plan
      </h3>

      {/* Solid colors */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-2">Couleur unie</p>
        <div className="grid grid-cols-6 gap-1.5">
          {SOLID_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => editorRef.current?.setBackgroundColor(color)}
              className="w-full aspect-square rounded-lg border border-gray-200 hover:border-purple-500 transition-colors hover:scale-110"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </div>

      {/* Gradients */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-2">Dégradés</p>
        <div className="grid grid-cols-2 gap-2">
          {GRADIENT_PRESETS.map((grad) => (
            <button
              key={grad.label}
              onClick={() => editorRef.current?.setBackgroundGradient(grad.colors)}
              className="h-12 rounded-lg border border-gray-200 hover:border-purple-500 transition-colors hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${grad.colors.join(", ")})`,
              }}
              title={grad.label}
            />
          ))}
        </div>
      </div>

      {/* Background image */}
      <div>
        <p className="text-[11px] font-semibold text-gray-500 mb-2">Image de fond</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-purple-400 hover:text-purple-600 transition-all"
        >
          Choisir une image
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
              const url = ev.target?.result as string;
              editorRef.current?.setBackgroundImage(url);
            };
            reader.readAsDataURL(file);
          }}
          className="hidden"
        />
      </div>
    </div>
  );
}
