"use client";

/* ─────────────────────────────────────────────────────────────
   EditorToolbar — Top toolbar (Canva-style)
   ───────────────────────────────────────────────────────────── */

import {
  Undo2,
  Redo2,
  Maximize2,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  ChevronsUp,
  ChevronsDown,
  Group,
  Ungroup,
  Lock,
  Unlock,
  Save,
  Download,
  Eye,
} from "lucide-react";
import type { CanvasEditorHandle } from "./CanvasEditor";
import type * as fabric from "fabric";
import { useState } from "react";

type Props = {
  editorRef: React.RefObject<CanvasEditorHandle | null>;
  selectedObject: fabric.FabricObject | null;
  zoom: number;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onPreview: () => void;
  saving: boolean;
  templateName: string;
  onNameChange: (name: string) => void;
  /** Optional publish handler (super_admin template mode) */
  onPublish?: () => void;
  publishing?: boolean;
  /** Label for the save button (default "Sauvegarder") */
  saveLabel?: string;
};

export default function EditorToolbar({
  editorRef,
  selectedObject,
  zoom,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onPreview,
  saving,
  templateName,
  onNameChange,
  onPublish,
  publishing,
  saveLabel,
}: Props) {
  const [editingName, setEditingName] = useState(false);

  const zoomPercent = Math.round(zoom * 100);

  return (
    <div className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 w-full shrink-0">

      {/* Left side: Template name */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {editingName ? (
          <input
            autoFocus
            value={templateName}
            onChange={(e) => onNameChange(e.target.value)}
            onBlur={() => setEditingName(false)}
            onKeyDown={(e) => (e.key === "Enter" ? setEditingName(false) : null)}
            className="text-sm font-semibold bg-gray-50 border border-gray-300 rounded px-2 py-1 w-52 outline-none focus:border-purple-500"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm font-semibold text-gray-700 truncate max-w-52 hover:text-purple-600 transition-colors text-left"
            title="Cliquer pour renommer"
          >
            {templateName || "Sans titre"}
          </button>
        )}
      </div>

      {/* Center side: Tools */}
      <div className="flex items-center gap-2 justify-center shrink-0">
        {/* Undo / Redo */}
        <ToolButton icon={Undo2} label="Annuler (Ctrl+Z)" onClick={onUndo} disabled={!canUndo} />
        <ToolButton icon={Redo2} label="Rétablir (Ctrl+Y)" onClick={onRedo} disabled={!canRedo} />

        <div className="w-px h-6 bg-gray-200 mx-1" />

        {/* Zoom slider (Canva-style) */}
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={10}
            max={400}
            value={zoomPercent}
            onChange={(e) => {
              const val = Number(e.target.value) / 100;
              editorRef.current?.setZoom(val);
            }}
            className="w-24 h-1 accent-gray-500 cursor-pointer appearance-none bg-gray-200 rounded-full [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gray-500 [&::-webkit-slider-thumb]:cursor-pointer hover:[&::-webkit-slider-thumb]:bg-gray-700 [&::-webkit-slider-thumb]:transition-colors"
            title={`Zoom: ${zoomPercent}%`}
          />
          <span className="text-xs font-medium text-gray-500 w-10 text-right tabular-nums select-none">
            {zoomPercent} %
          </span>
        </div>
        <ToolButton icon={Maximize2} label="Ajuster" onClick={() => editorRef.current?.zoomFit()} />

        {/* Object controls (visible when selected) */}
        {selectedObject && (
          <>
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <ToolButton icon={Copy} label="Dupliquer (Ctrl+D)" onClick={() => editorRef.current?.duplicateSelected()} />
            <ToolButton icon={Trash2} label="Supprimer" onClick={() => editorRef.current?.deleteSelected()} className="text-red-500 hover:bg-red-50" />

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Z-index */}
            <ToolButton icon={ChevronsUp} label="Premier plan" onClick={() => editorRef.current?.bringToFront()} />
            <ToolButton icon={ArrowUp} label="Monter" onClick={() => editorRef.current?.bringForward()} />
            <ToolButton icon={ArrowDown} label="Descendre" onClick={() => editorRef.current?.sendBackward()} />
            <ToolButton icon={ChevronsDown} label="Arrière-plan" onClick={() => editorRef.current?.sendToBack()} />

            <div className="w-px h-6 bg-gray-200 mx-1" />

            {/* Group */}
            <ToolButton icon={Group} label="Grouper" onClick={() => editorRef.current?.groupSelected()} />
            <ToolButton icon={Ungroup} label="Dégrouper" onClick={() => editorRef.current?.ungroupSelected()} />

            {/* Lock */}
            {selectedObject.lockMovementX ? (
              <ToolButton icon={Lock} label="Déverrouiller" onClick={() => {
                selectedObject.set({
                  lockMovementX: false,
                  lockMovementY: false,
                  lockRotation: false,
                  lockScalingX: false,
                  lockScalingY: false,
                });
                editorRef.current?.getCanvas()?.requestRenderAll();
              }} />
            ) : (
              <ToolButton icon={Unlock} label="Verrouiller" onClick={() => {
                selectedObject.set({
                  lockMovementX: true,
                  lockMovementY: true,
                  lockRotation: true,
                  lockScalingX: true,
                  lockScalingY: true,
                });
                editorRef.current?.getCanvas()?.requestRenderAll();
              }} />
            )}
          </>
        )}
      </div>

      {/* Right side: Actions */}
      <div className="flex items-center gap-2 flex-1 justify-end min-w-0">
        <ToolButton icon={Eye} label="Aperçu" onClick={onPreview} />
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {saving ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saving ? "Sauvegarde..." : (saveLabel ?? "Sauvegarder")}
        </button>
        {onPublish && (
          <button
            onClick={onPublish}
            disabled={publishing}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {publishing ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            )}
            {publishing ? "Publication..." : "Publier"}
          </button>
        )}
        <ToolButton
          icon={Download}
          label="Exporter PNG"
          onClick={() => {
            const url = editorRef.current?.toDataURL(3);
            if (url) {
              const a = document.createElement("a");
              a.href = url;
              a.download = `${templateName || "template"}.png`;
              a.click();
            }
          }}
        />
      </div>
    </div>
  );
}

/* ── Tool button with tooltip ── */
function ToolButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors ${className}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}
