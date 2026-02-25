"use client";

/* ─────────────────────────────────────────────────────────────
   TemplateEditorModal — Full-screen overlay Canva-like editor
   Opens INSIDE the main editor when super_admin clicks
   "Créer un template" in the sidebar.
   ───────────────────────────────────────────────────────────── */

import { useState, useRef, useCallback, useEffect } from "react";
import dynamic from "next/dynamic";
import type { CanvasEditorHandle } from "@/components/template-editor/CanvasEditor";
import EditorToolbar from "@/components/template-editor/EditorToolbar";
import EditorSidePanel from "@/components/template-editor/EditorSidePanel";
import TemplatePropertyPanel from "@/components/template-editor/PropertyPanel";
import LayersPanel from "@/components/template-editor/LayersPanel";
import { PAGE_SIZES, type PageSizeKey } from "@/lib/template-editor/fabric-init";
import { saveTemplate, savePageFabricJSON } from "@/lib/template-editor/template-saver";
import { buildCanvasFromGridSafe } from "@/lib/template-editor/grid-to-fabric";
import { useAuth } from "@/lib/auth/AuthContext";
import type { GridCell, PageElement, LayoutTemplate } from "@/lib/types/editor";
import * as fabric from "fabric";

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

/* ── Auto-save draft helpers ── */
const DRAFT_PREFIX = "memoriz-tpl-draft-";

type DraftData = {
  canvasJSON: string;
  templateName: string;
  pageSize: PageSizeKey;
  pageType: "cover" | "interior" | "back";
  themeId: string;
  savedAt: number; // timestamp
};

function getDraftKey(themeId: string) {
  return `${DRAFT_PREFIX}${themeId}`;
}

function loadDraft(themeId: string): DraftData | null {
  try {
    const raw = localStorage.getItem(getDraftKey(themeId));
    if (!raw) return null;
    const draft = JSON.parse(raw) as DraftData;
    // Validate essential fields
    if (!draft.canvasJSON || !draft.themeId) return null;
    return draft;
  } catch {
    return null;
  }
}

function saveDraft(data: DraftData) {
  try {
    localStorage.setItem(getDraftKey(data.themeId), JSON.stringify(data));
  } catch {
    // localStorage full or blocked — silently ignore
  }
}

function clearDraft(themeId: string) {
  try {
    localStorage.removeItem(getDraftKey(themeId));
  } catch {
    // ignore
  }
}

function formatTimeSince(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "il y a quelques secondes";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} jour${days > 1 ? "s" : ""}`;
}

type Props = {
  /** For template-creation mode (super_admin) */
  themeId?: string;
  /** For page-editing mode (any user editing a page) */
  pageId?: string;
  /** Initial Fabric JSON to load (from template or from page's fabric_json) */
  initialFabricJSON?: string | null;
  /** Canvas dimensions for page-editing mode */
  pageDimensions?: { width: number; height: number };
  /** Human label shown in top bar for page mode, e.g. "Couverture" */
  pageLabel?: string;
  /** Grid cells from the current layout (for rendering grid layout pages in Fabric) */
  gridCells?: GridCell[];
  /** Page elements placed on the current page (photos, texts) */
  pageElements?: PageElement[];
  /** All available layouts (passed to EditorSidePanel "Mises en page" tab) */
  layouts?: LayoutTemplate[];
  /** Callback when a layout is selected from the Fabric editor's layout panel */
  onSelectLayout?: (layoutId: string) => void;

  onClose: () => void;
  /** Called after a template is successfully saved so the parent can refresh layouts */
  onTemplateSaved?: () => void;
  /** Called after a page's fabric_json is saved */
  onPageSaved?: () => void;
};

export default function TemplateEditorModal({
  themeId,
  pageId,
  initialFabricJSON,
  pageDimensions,
  pageLabel,
  gridCells,
  pageElements,
  layouts,
  onSelectLayout,
  onClose,
  onTemplateSaved,
  onPageSaved,
}: Props) {
  const { isSuperAdmin } = useAuth();
  const isPageMode = !!pageId;
  const effectiveThemeId = themeId ?? "page";
  const editorRef = useRef<CanvasEditorHandle>(null);
  const [selectedObject, setSelectedObject] = useState<fabric.FabricObject | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  // Layout drop confirmation (shown when canvas has objects)
  const [layoutDropConfirm, setLayoutDropConfirm] = useState<string | null>(null);
  const [templateName, setTemplateName] = useState(
    isPageMode ? (pageLabel ?? "Page") : `Template ${THEME_LABELS[themeId ?? ""] ?? themeId}`
  );
  const [pageSize, setPageSize] = useState<PageSizeKey>(() => {
    if (pageDimensions) {
      // Find matching PAGE_SIZE or default to CUSTOM
      const match = Object.entries(PAGE_SIZES).find(
        ([, v]) => v.width === pageDimensions.width && v.height === pageDimensions.height
      );
      return (match?.[0] as PageSizeKey) ?? "CUSTOM";
    }
    return "A4_PORTRAIT";
  });
  const [pageType, setPageType] = useState<"cover" | "interior" | "back">("cover");
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  // Incremented whenever objects change so LayersPanel refreshes
  const [layerRefreshKey, setLayerRefreshKey] = useState(0);
  const bumpLayers = useCallback(() => setLayerRefreshKey((k) => k + 1), []);

  /* ── Draft auto-save ── */
  const [draftStatus, setDraftStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const pendingDraft = useRef<DraftData | null>(null);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const canvasReady = useRef(false);

  // Check for existing draft on mount (template mode only)
  useEffect(() => {
    if (isPageMode) return; // Page mode doesn't use drafts
    const draft = loadDraft(effectiveThemeId);
    if (draft) {
      pendingDraft.current = draft;
      setShowDraftPrompt(true);
      // Restore metadata immediately
      setTemplateName(draft.templateName);
      setPageSize(draft.pageSize);
      setPageType(draft.pageType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Restore draft when canvas is ready OR load initial fabric JSON (page mode)
  const handleCanvasReady = useCallback(() => {
    canvasReady.current = true;

    if (isPageMode) {
      // Case 1: Page has saved fabric_json OR a Fabric template → load the JSON
      if (initialFabricJSON && editorRef.current) {
        setTimeout(() => {
          editorRef.current?.loadFromJSON(initialFabricJSON).catch((err) => {
            console.error("Failed to load page fabric JSON:", err);
          });
        }, 150);
        return;
      }

      // Case 2: Page has a grid layout with cells → build canvas from grid
      if (gridCells && gridCells.length > 0 && editorRef.current) {
        const dims = pageDimensions ?? { width: 595, height: 842 };
        setTimeout(() => {
          const canvas = editorRef.current?.getCanvas();
          buildCanvasFromGridSafe(
            canvas,
            gridCells,
            pageElements ?? [],
            dims.width,
            dims.height,
          );
        }, 150);
        return;
      }
    }

    if (pendingDraft.current && showDraftPrompt) {
      // Don't auto-restore — wait for user to accept
    }
  }, [isPageMode, initialFabricJSON, gridCells, pageElements, pageDimensions, showDraftPrompt]);

  const restoreDraft = useCallback(async () => {
    const draft = pendingDraft.current;
    if (!draft || !editorRef.current) return;
    try {
      await editorRef.current.loadFromJSON(draft.canvasJSON);
    } catch (err) {
      console.error("Failed to restore draft:", err);
    }
    pendingDraft.current = null;
    setShowDraftPrompt(false);
  }, []);

  const discardDraft = useCallback(() => {
    clearDraft(effectiveThemeId);
    pendingDraft.current = null;
    setShowDraftPrompt(false);
  }, [effectiveThemeId]);

  /* ── Apply a layout to the Fabric canvas ── */
  const applyLayoutToCanvas = useCallback((layoutId: string) => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas) return;

    const layout = layouts?.find((l) => l.id === layoutId);
    if (!layout) return;

    const cells: GridCell[] = Array.isArray(layout.grid_config) ? layout.grid_config : [];
    if (cells.length === 0) return;

    const dims = pageDimensions ?? { width: canvas.getWidth(), height: canvas.getHeight() };
    buildCanvasFromGridSafe(canvas, cells, [], dims.width, dims.height);
    editorRef.current?.getHistory()?.saveState();

    // Also notify parent so layout_id gets persisted
    onSelectLayout?.(layoutId);
  }, [layouts, pageDimensions, onSelectLayout]);

  /** Called by CanvasEditor when a layout card is dropped onto the canvas */
  const handleDropLayout = useCallback((layoutId: string) => {
    const canvas = editorRef.current?.getCanvas();
    const hasObjects = canvas && canvas.getObjects().length > 0;

    if (hasObjects) {
      // Canvas has content → show confirmation dialog
      setLayoutDropConfirm(layoutId);
    } else {
      // Canvas is empty → apply directly
      applyLayoutToCanvas(layoutId);
    }
  }, [applyLayoutToCanvas]);

  // Auto-save function (debounced)
  const triggerAutoSave = useCallback(() => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(async () => {
      if (!editorRef.current || !canvasReady.current) return;

      try {
        const canvasJSON = editorRef.current.toJSON();
        if (!canvasJSON || canvasJSON === "{}") return;

        setDraftStatus("saving");

        // If we are editing a Page, automatically save it to the DB silently
        if (isPageMode && pageId) {
          const thumbnailDataURL = editorRef.current.toDataURL(1);
          const result = await savePageFabricJSON(pageId, canvasJSON, thumbnailDataURL);
          if (!result.error) {
            setDraftStatus("saved");
            setTimeout(() => setDraftStatus("idle"), 2000);
          }
        } else {
          // If we are creating a Template, save draft to localStorage
          saveDraft({
            canvasJSON,
            templateName,
            pageSize,
            pageType,
            themeId: effectiveThemeId,
            savedAt: Date.now(),
          });
          setDraftStatus("saved");
          setTimeout(() => setDraftStatus("idle"), 2000);
        }
      } catch (err) {
        // Best effort
      }
    }, 1500); // 1.5s debounce
  }, [templateName, pageSize, pageType, effectiveThemeId, isPageMode, pageId]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, []);

  // Auto-save when metadata changes (name, page size, page type)
  useEffect(() => {
    if (canvasReady.current) triggerAutoSave();
  }, [templateName, pageSize, pageType, triggerAutoSave]);

  // Escape key to close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !showPreview) {
        // Don't close if editing text
        const active = editorRef.current?.getCanvas()?.getActiveObject();
        if (active && (active as fabric.Textbox).isEditing) return;
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose, showPreview]);

  // Update undo/redo state
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
      triggerAutoSave();
    }
  }, [triggerAutoSave]);

  const handleRedo = useCallback(async () => {
    const history = editorRef.current?.getHistory();
    if (history) {
      await history.redo();
      editorRef.current?.getCanvas()?.requestRenderAll();
      triggerAutoSave();
    }
  }, [triggerAutoSave]);

  const handleSave = useCallback(async () => {
    if (!editorRef.current) return;
    setSaving(true);

    try {
      const canvasJSON = editorRef.current.toJSON();

      // ── Page-edit mode: save to project_pages.fabric_json + thumbnail ──
      if (isPageMode && pageId) {
        const thumbnailDataURL = editorRef.current.toDataURL(1);
        const result = await savePageFabricJSON(pageId, canvasJSON, thumbnailDataURL);
        if (result.error) {
          alert(`Erreur: ${result.error}`);
        } else {
          setShowSaveSuccess(true);
          onPageSaved?.();
          setTimeout(() => setShowSaveSuccess(false), 3000);
        }
        setSaving(false);
        return;
      }

      // ── Template-creation mode: save to layout_templates (draft) ──
      const thumbnailDataURL = editorRef.current.toDataURL(1);

      const canvas = editorRef.current.getCanvas();
      const imageCount = canvas
        ? canvas.getObjects().filter((o) => o instanceof fabric.FabricImage).length
        : 0;

      const currentSize = PAGE_SIZES[pageSize];
      const result = await saveTemplate({
        name: templateName,
        category: effectiveThemeId,
        canvasJSON,
        thumbnailDataURL,
        pageType,
        photoCount: imageCount,
        canvasWidth: currentSize.width,
        canvasHeight: currentSize.height,
        isPublished: false, // Save as draft by default
      });

      if ("error" in result) {
        alert(`Erreur: ${result.error}`);
      } else {
        // Clear draft on successful save
        clearDraft(effectiveThemeId);
        setShowSaveSuccess(true);
        onTemplateSaved?.();
        setTimeout(() => setShowSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert("Erreur lors de la sauvegarde");
      console.error(err);
    } finally {
      setSaving(false);
    }
  }, [templateName, effectiveThemeId, pageType, onTemplateSaved, isPageMode, pageId, onPageSaved, pageSize]);

  // ── Publish handler (super_admin only) ──
  // Template mode: publishes the template to layout_templates (visible to all)
  // Page mode: saves fabric_json to the page AND publishes as a reusable template
  const handlePublish = useCallback(async () => {
    if (!editorRef.current) return;
    setPublishing(true);

    try {
      const canvasJSON = editorRef.current.toJSON();
      const thumbnailDataURL = editorRef.current.toDataURL(1);

      const canvas = editorRef.current.getCanvas();
      const imageCount = canvas
        ? canvas.getObjects().filter((o) => o instanceof fabric.FabricImage).length
        : 0;

      const currentSize = isPageMode && pageDimensions
        ? pageDimensions
        : PAGE_SIZES[pageSize];

      // In page mode, also save the fabric_json + thumbnail to this page first
      if (isPageMode && pageId) {
        await savePageFabricJSON(pageId, canvasJSON, thumbnailDataURL);
      }

      const result = await saveTemplate({
        name: templateName,
        category: effectiveThemeId,
        canvasJSON,
        thumbnailDataURL,
        pageType,
        photoCount: imageCount,
        canvasWidth: currentSize.width,
        canvasHeight: currentSize.height,
        isPublished: true, // Publish immediately
      });

      if ("error" in result) {
        alert(`Erreur: ${result.error}`);
      } else {
        clearDraft(effectiveThemeId);
        setShowSaveSuccess(true);
        onTemplateSaved?.();
        if (isPageMode) onPageSaved?.();
        setTimeout(() => setShowSaveSuccess(false), 3000);
      }
    } catch (err) {
      alert("Erreur lors de la publication");
      console.error(err);
    } finally {
      setPublishing(false);
    }
  }, [templateName, effectiveThemeId, pageType, onTemplateSaved, isPageMode, pageId, pageDimensions, pageSize, onPageSaved]);

  const handlePreview = useCallback(() => {
    if (!editorRef.current) return;
    const url = editorRef.current.toDataURL(2);
    setPreviewImage(url);
    setShowPreview(true);
  }, []);

  const size = isPageMode && pageDimensions
    ? { ...pageDimensions, label: `${pageDimensions.width}×${pageDimensions.height}` }
    : PAGE_SIZES[pageSize];

  return (
    <div className="fixed inset-0 z-[200] bg-gray-100 flex flex-col overflow-hidden">
      {/* Top bar: navigation + page size + page type */}
      <div className="h-10 bg-gray-900 flex items-center px-4 gap-4 text-white text-xs shrink-0">
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Fermer l&apos;éditeur
        </button>
        <span className="text-gray-600">|</span>
        {isPageMode ? (
          <span className="text-blue-400 font-semibold">
            {pageLabel ?? "Page"}
          </span>
        ) : (
          <span className="text-purple-400 font-semibold">
            {THEME_LABELS[themeId ?? ""] ?? themeId}
          </span>
        )}
        <span className="text-gray-600">|</span>

        {/* Page size — only changeable in template mode */}
        {!isPageMode ? (
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
        ) : (
          <span className="text-gray-400">
            {size.width} × {size.height} px
          </span>
        )}

        {/* Page type — only in template mode */}
        {!isPageMode && (
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
        )}

        <div className="flex-1" />

        {/* Auto-save indicator */}
        {draftStatus === "saving" && (
          <span className="text-yellow-400 text-[10px] flex items-center gap-1 animate-pulse">
            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Sauvegarde…
          </span>
        )}
        {draftStatus === "saved" && (
          <span className="text-green-400 text-[10px] flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Brouillon sauvegardé
          </span>
        )}

        <span className="text-gray-500">
          {size.width} × {size.height} px
        </span>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        editorRef={editorRef}
        selectedObject={selectedObject}
        zoom={zoomLevel}
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={handleSave}
        onPreview={handlePreview}
        saving={saving}
        templateName={templateName}
        onNameChange={setTemplateName}
        onPublish={isSuperAdmin ? handlePublish : undefined}
        publishing={publishing}
        saveLabel={isPageMode ? "Sauvegarder" : "Enregistrer"}
      />

      {/* Main editor area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar */}
        <EditorSidePanel
          editorRef={editorRef}
          layouts={layouts}
          onSelectLayout={handleDropLayout}
        />

        {/* Canvas */}
        <CanvasEditor
          ref={editorRef}
          width={size.width}
          height={size.height}
          onCanvasReady={handleCanvasReady}
          onSelectionChange={(obj) => {
            setSelectedObject(obj);
            bumpLayers();
          }}
          onZoomChange={setZoomLevel}
          onDropLayout={handleDropLayout}
          onObjectModified={() => {
            const history = editorRef.current?.getHistory();
            if (history) {
              setCanUndo(history.canUndo);
              setCanRedo(history.canRedo);
            }
            bumpLayers();
            triggerAutoSave();
          }}
        />

        {/* Right panel: properties + layers */}
        <div className="flex flex-col w-80 shrink-0 border-l border-gray-200 bg-white overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <TemplatePropertyPanel
              selectedObject={selectedObject}
              editorRef={editorRef}
            />
          </div>
          <LayersPanel
            editorRef={editorRef}
            selectedObject={selectedObject}
            refreshKey={layerRefreshKey}
          />
        </div>
      </div>

      {/* Layout drop confirmation (canvas has content) */}
      {layoutDropConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[230] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg font-bold">
                ⚠
              </div>
              <h3 className="text-lg font-bold text-gray-900">Changer la mise en page ?</h3>
            </div>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Appliquer cette mise en page va <strong className="text-gray-900">supprimer tous les éléments</strong> actuellement sur le canvas. Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setLayoutDropConfirm(null)}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const id = layoutDropConfirm;
                  setLayoutDropConfirm(null);
                  applyLayoutToCanvas(id);
                }}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                Oui, appliquer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft restore prompt */}
      {showDraftPrompt && pendingDraft.current && (
        <div className="fixed inset-0 bg-black/50 z-[230] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Brouillon trouvé</h3>
                <p className="text-xs text-gray-500">
                  Sauvegardé {formatTimeSince(pendingDraft.current.savedAt)}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Un brouillon de <strong>&quot;{pendingDraft.current.templateName}&quot;</strong> a été retrouvé.
              Voulez-vous reprendre là où vous en étiez ?
            </p>
            <div className="flex gap-3">
              <button
                onClick={discardDraft}
                className="flex-1 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Non, recommencer
              </button>
              <button
                onClick={restoreDraft}
                className="flex-1 px-4 py-2.5 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors"
              >
                Oui, reprendre
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success toast */}
      {showSaveSuccess && (
        <div className="fixed bottom-6 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 z-[210]">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isPageMode ? "Page sauvegardée !" : publishing ? "Template publié ! Visible pour tous les utilisateurs." : "Brouillon enregistré."}
        </div>
      )}

      {/* Preview overlay */}
      {showPreview && previewImage && (
        <div
          className="fixed inset-0 bg-black/80 z-[220] flex items-center justify-center p-8"
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
