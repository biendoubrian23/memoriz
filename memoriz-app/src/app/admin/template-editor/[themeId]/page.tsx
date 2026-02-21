"use client";

/* ─────────────────────────────────────────────────────────────
   Admin — Template Editor — Fabric.js Canva-like editor
   Creates templates for a specific theme (magazine, famille…)
   ───────────────────────────────────────────────────────────── */

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import dynamic from "next/dynamic";
import type { CanvasEditorHandle } from "@/components/template-editor/CanvasEditor";
import EditorToolbar from "@/components/template-editor/EditorToolbar";
import EditorSidePanel from "@/components/template-editor/EditorSidePanel";
import TemplatePropertyPanel from "@/components/template-editor/PropertyPanel";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/template-editor/fabric-init";
import { saveTemplate, generateThumbnail } from "@/lib/template-editor/template-saver";
import * as fabric from "fabric";

// Dynamic import for CanvasEditor (no SSR — canvas needs DOM)
const CanvasEditor = dynamic(
  () => import("@/components/template-editor/CanvasEditor"),
  { ssr: false }
);

const THEME_LABELS: Record<string, string> = {
  magazine: "Magazine",
  famille: "Album Famille",
  "road-trip": "Road Trip",
  mariage: "Mariage",
  bebe: "Bébé · Naissance",
};

export default function ThemeEditorPage() {
  const params = useParams();
  const router = useRouter();
  const themeId = params.themeId as string;
  const { user, loading: authLoading, isSuperAdmin } = useAuth();

  const editorRef = useRef<CanvasEditorHandle>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.FabricObject | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [templateName, setTemplateName] = useState(`Template ${THEME_LABELS[themeId] ?? themeId}`);
  const [pageSize, setPageSize] = useState<PageSizeKey>("A4_PORTRAIT");
  const [pageType, setPageType] = useState<"cover" | "interior" | "back">("cover");
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Protect route
  useEffect(() => {
    if (!authLoading && (!user || !isSuperAdmin)) {
      router.push("/");
    }
  }, [authLoading, user, isSuperAdmin, router]);

  // Update undo/redo state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const history = editorRef.current?.getHistory();
      if (history) {
        setCanUndo(history.canUndo);
        setCanRedo(history.canRedo);
      }
    }, 300);
    return () => clearInterval(interval);
  }, []);

  const handleUndo = useCallback(async () => {
    const history = editorRef.current?.getHistory();
    if (history) {
      await history.undo();
      editorRef.current?.getCanvas()?.requestRenderAll();
    }
  }, []);

  const handleRedo = useCallback(async () => {
    const history = editorRef.current?.getHistory();
    if (history) {
      await history.redo();
      editorRef.current?.getCanvas()?.requestRenderAll();
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    setSaving(true);

    try {
      const canvasJSON = editorRef.current.toJSON();
      const thumbnailDataURL = editorRef.current.toDataURL(1);

      // Count images in canvas
      const canvas = editorRef.current.getCanvas();
      const imageCount = canvas
        ? canvas.getObjects().filter((o) => o instanceof fabric.FabricImage).length
        : 0;

      const result = await saveTemplate({
        name: templateName,
        category: themeId,
        canvasJSON,
        thumbnailDataURL,
        pageType,
        photoCount: imageCount,
      });

      if ("error" in result) {
        alert(`Erreur: ${result.error}`);
      } else {
        setShowSaveSuccess(true);
        setTimeout(() => setShowSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert("Erreur lors de la sauvegarde");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [templateName, themeId, pageType]);

  const handlePreview = useCallback(() => {
    if (!editorRef.current) return;
    const url = editorRef.current.toDataURL(2);
    setPreviewImage(url);
    setShowPreview(true);
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) return null;

  const size = PAGE_SIZES[pageSize];

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Top bar: page size selector + page type */}
      <div className="h-10 bg-gray-900 flex items-center px-4 gap-4 text-white text-xs shrink-0">
        <button
          onClick={() => router.push("/admin/template-editor")}
          className="text-gray-400 hover:text-white transition-colors"
        >
          ← Retour aux thèmes
        </button>
        <span className="text-gray-600">|</span>
        <span className="text-purple-400 font-semibold">
          {THEME_LABELS[themeId] ?? themeId}
        </span>
        <span className="text-gray-600">|</span>

        {/* Page size */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Format :</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(e.target.value as PageSizeKey)}
            aria-label="Format de page"
            className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-xs text-white outline-none"
          >
            {Object.entries(PAGE_SIZES).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label} ({val.width}×{val.height})
              </option>
            ))}
          </select>
        </div>

        {/* Page type */}
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Type :</span>
          <select
            value={pageType}
            onChange={(e) => setPageType(e.target.value as "cover" | "interior" | "back")}
            aria-label="Type de page"
            className="bg-gray-800 border border-gray-700 rounded px-2 py-0.5 text-xs text-white outline-none"
          >
            <option value="cover">Couverture</option>
            <option value="interior">Intérieur</option>
            <option value="back">Dos</option>
          </select>
        </div>

        <div className="flex-1" />

        <span className="text-gray-500">
          {size.width} × {size.height} px
        </span>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        editorRef={editorRef}
        selectedObject={selectedObject}
        zoom={editorRef.current?.getZoom() ?? 1}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onPreview={handlePreview}
        saving={saving}
        templateName={templateName}
        onNameChange={setTemplateName}
      />

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <EditorSidePanel editorRef={editorRef} />

        {/* Canvas */}
        <CanvasEditor
          ref={editorRef}
          width={size.width}
          height={size.height}
          onSelectionChange={setSelectedObject}
          onObjectModified={() => {
            const history = editorRef.current?.getHistory();
            if (history) {
              setCanUndo(history.canUndo);
              setCanRedo(history.canRedo);
            }
          }}
        />

        {/* Right property panel */}
        <TemplatePropertyPanel
          selectedObject={selectedObject}
          editorRef={editorRef}
        />
      </div>

      {/* Success toast */}
      {showSaveSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-fade-in z-50">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Template sauvegardé ! Visible pour tous les utilisateurs.
        </div>
      )}

      {/* Preview overlay */}
      {showPreview && previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8"
          onClick={() => setShowPreview(false)}
        >
          <div className="relative max-w-3xl max-h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <button
              onClick={() => setShowPreview(false)}
              className="absolute -top-3 -right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-red-600"
            >
              ✕
            </button>
            <p className="text-center text-white/60 text-sm mt-4">
              Cliquez n&apos;importe où pour fermer
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
