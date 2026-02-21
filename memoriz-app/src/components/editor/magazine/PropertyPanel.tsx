"use client";

import { useCallback } from "react";
import {
  Type,
  ImageIcon,
  Square,
  Trash2,
  Copy,
  Lock,
  Unlock,
  ChevronsUp,
  ChevronsDown,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  RotateCw,
} from "lucide-react";
import type { FreeformElement } from "@/lib/types/editor";
import { FONT_FAMILIES } from "@/lib/magazine-templates";

type Props = {
  element: FreeformElement;
  maxZIndex: number;
  onUpdate: (updates: Partial<FreeformElement>) => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onReplaceImage?: () => void;
};

export default function PropertyPanel({
  element,
  maxZIndex,
  onUpdate,
  onDelete,
  onDuplicate,
  onReplaceImage,
}: Props) {
  const u = useCallback(
    (field: keyof FreeformElement, value: unknown) =>
      onUpdate({ [field]: value }),
    [onUpdate]
  );

  return (
    <div className="h-full overflow-y-auto space-y-4 text-sm">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
        {element.type === "text" && <Type className="w-4 h-4 text-blue-500" />}
        {element.type === "image" && <ImageIcon className="w-4 h-4 text-green-500" />}
        {element.type === "shape" && <Square className="w-4 h-4 text-orange-500" />}
        <span className="font-semibold text-dark capitalize">{element.type}</span>
        <div className="flex-1" />
        <button
          onClick={() => u("locked", !element.locked)}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          title={element.locked ? "Déverrouiller" : "Verrouiller"}
        >
          {element.locked ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-gray-400" />}
        </button>
      </div>

      {/* ── TEXT PROPERTIES ── */}
      {element.type === "text" && (
        <>
          {/* Font Family */}
          <PropGroup label="Police">
            <select
              value={element.fontFamily ?? "Montserrat"}
              onChange={(e) => u("fontFamily", e.target.value)}
              className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-primary/30 focus:border-primary"
              style={{ fontFamily: element.fontFamily }}
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
          </PropGroup>

          {/* Size + Weight */}
          <div className="grid grid-cols-2 gap-2">
            <PropGroup label="Taille">
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min={0.5}
                  max={20}
                  step={0.1}
                  value={element.fontSize ?? 3}
                  onChange={(e) => u("fontSize", parseFloat(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-[10px] text-gray-500 w-8 text-right">
                  {(element.fontSize ?? 3).toFixed(1)}
                </span>
              </div>
            </PropGroup>

            <PropGroup label="Graisse">
              <select
                value={element.fontWeight ?? "400"}
                onChange={(e) => u("fontWeight", e.target.value)}
                className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-xs bg-white"
              >
                {["100", "200", "300", "400", "500", "600", "700", "800", "900"].map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </PropGroup>
          </div>

          {/* Color */}
          <PropGroup label="Couleur">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={element.textColor ?? "#000000"}
                onChange={(e) => u("textColor", e.target.value)}
                className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
              />
              <input
                type="text"
                value={element.textColor ?? "#000000"}
                onChange={(e) => u("textColor", e.target.value)}
                className="flex-1 px-2 py-1.5 rounded-lg border border-gray-200 text-xs font-mono"
              />
            </div>
          </PropGroup>

          {/* Alignment + Style */}
          <PropGroup label="Alignement & Style">
            <div className="flex items-center gap-1">
              {(["left", "center", "right"] as const).map((al) => (
                <button
                  key={al}
                  onClick={() => u("textAlign", al)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    element.textAlign === al ? "bg-primary/10 text-primary" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {al === "left" && <AlignLeft className="w-4 h-4" />}
                  {al === "center" && <AlignCenter className="w-4 h-4" />}
                  {al === "right" && <AlignRight className="w-4 h-4" />}
                </button>
              ))}
              <div className="w-px h-5 bg-gray-200 mx-1" />
              <button
                onClick={() => u("fontWeight", element.fontWeight === "700" ? "400" : "700")}
                className={`p-1.5 rounded-lg transition-colors ${
                  element.fontWeight === "700" ? "bg-primary/10 text-primary" : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onClick={() => u("fontStyle", element.fontStyle === "italic" ? "normal" : "italic")}
                className={`p-1.5 rounded-lg transition-colors ${
                  element.fontStyle === "italic" ? "bg-primary/10 text-primary" : "hover:bg-gray-100 text-gray-500"
                }`}
              >
                <Italic className="w-4 h-4" />
              </button>
            </div>
          </PropGroup>

          {/* Letter Spacing + Line Height */}
          <div className="grid grid-cols-2 gap-2">
            <PropGroup label="Espacement">
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min={-0.1}
                  max={0.5}
                  step={0.01}
                  value={element.letterSpacing ?? 0}
                  onChange={(e) => u("letterSpacing", parseFloat(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-[10px] text-gray-500 w-8 text-right">
                  {(element.letterSpacing ?? 0).toFixed(2)}
                </span>
              </div>
            </PropGroup>

            <PropGroup label="Interligne">
              <div className="flex items-center gap-1">
                <input
                  type="range"
                  min={0.5}
                  max={3}
                  step={0.05}
                  value={element.lineHeight ?? 1.2}
                  onChange={(e) => u("lineHeight", parseFloat(e.target.value))}
                  className="flex-1 accent-primary"
                />
                <span className="text-[10px] text-gray-500 w-8 text-right">
                  {(element.lineHeight ?? 1.2).toFixed(2)}
                </span>
              </div>
            </PropGroup>
          </div>

          {/* Text Transform */}
          <PropGroup label="Casse">
            <div className="flex gap-1">
              {([
                { val: "none", label: "Aa" },
                { val: "uppercase", label: "AA" },
                { val: "lowercase", label: "aa" },
                { val: "capitalize", label: "Ab" },
              ] as const).map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => u("textTransform", val)}
                  className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                    (element.textTransform ?? "none") === val
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </PropGroup>

          {/* Text Shadow */}
          <PropGroup label="Ombre">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!element.textShadow && element.textShadow !== "none"}
                  onChange={(e) =>
                    u("textShadow", e.target.checked ? "1px 2px 4px rgba(0,0,0,0.4)" : "none")
                  }
                  className="rounded accent-primary"
                />
                <span className="text-xs text-gray-600">Activer</span>
              </label>
            </div>
          </PropGroup>
        </>
      )}

      {/* ── IMAGE PROPERTIES ── */}
      {element.type === "image" && (
        <>
          {onReplaceImage && (
            <PropGroup label="Image">
              <button
                onClick={onReplaceImage}
                className="w-full py-2 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:border-primary hover:text-primary transition-colors"
              >
                Remplacer l&apos;image
              </button>
            </PropGroup>
          )}

          <PropGroup label="Ajustement">
            <div className="flex gap-1">
              {(["cover", "contain", "fill"] as const).map((fit) => (
                <button
                  key={fit}
                  onClick={() => u("objectFit", fit)}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                    (element.objectFit ?? "cover") === fit
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {fit === "cover" ? "Remplir" : fit === "contain" ? "Ajuster" : "Étirer"}
                </button>
              ))}
            </div>
          </PropGroup>

          <PropGroup label="Arrondi">
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={element.borderRadius ?? 0}
                onChange={(e) => u("borderRadius", parseInt(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-[10px] text-gray-500 w-6 text-right">{element.borderRadius ?? 0}</span>
            </div>
          </PropGroup>
        </>
      )}

      {/* ── SHAPE PROPERTIES ── */}
      {element.type === "shape" && (
        <>
          <PropGroup label="Type">
            <div className="flex gap-1">
              {(["rectangle", "circle", "line"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => u("shapeType", s)}
                  className={`px-2 py-1 rounded-lg text-xs transition-colors ${
                    (element.shapeType ?? "rectangle") === s
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {s === "rectangle" ? "Rect" : s === "circle" ? "Cercle" : "Ligne"}
                </button>
              ))}
            </div>
          </PropGroup>

          <div className="grid grid-cols-2 gap-2">
            <PropGroup label="Fond">
              <input
                type="color"
                value={element.fillColor ?? "#ffffff"}
                onChange={(e) => u("fillColor", e.target.value)}
                className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
              />
            </PropGroup>
            <PropGroup label="Contour">
              <input
                type="color"
                value={element.strokeColor ?? "#000000"}
                onChange={(e) => u("strokeColor", e.target.value)}
                className="w-full h-8 rounded-lg border border-gray-200 cursor-pointer"
              />
            </PropGroup>
          </div>

          <PropGroup label="Épaisseur contour">
            <div className="flex items-center gap-1">
              <input
                type="range"
                min={0}
                max={10}
                step={0.5}
                value={element.strokeWidth ?? 1}
                onChange={(e) => u("strokeWidth", parseFloat(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="text-[10px] text-gray-500 w-6 text-right">{element.strokeWidth ?? 1}</span>
            </div>
          </PropGroup>
        </>
      )}

      {/* ── COMMON PROPERTIES ── */}
      <div className="border-t border-gray-100 pt-3 space-y-3">
        {/* Opacity */}
        <PropGroup label="Opacité">
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={element.opacity}
              onChange={(e) => u("opacity", parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-[10px] text-gray-500 w-8 text-right">
              {Math.round(element.opacity * 100)}%
            </span>
          </div>
        </PropGroup>

        {/* Rotation */}
        <PropGroup label="Rotation">
          <div className="flex items-center gap-1">
            <RotateCw className="w-3.5 h-3.5 text-gray-400" />
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={element.rotation}
              onChange={(e) => u("rotation", parseFloat(e.target.value))}
              className="flex-1 accent-primary"
            />
            <span className="text-[10px] text-gray-500 w-8 text-right">
              {Math.round(element.rotation)}°
            </span>
          </div>
        </PropGroup>

        {/* Z-Index */}
        <PropGroup label="Ordre">
          <div className="flex gap-1">
            <button
              onClick={() => u("zIndex", maxZIndex + 1)}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 transition-colors"
            >
              <ChevronsUp className="w-3.5 h-3.5" />
              Devant
            </button>
            <button
              onClick={() => u("zIndex", Math.max(0, element.zIndex - 1))}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg border border-gray-200 text-xs hover:bg-gray-50 transition-colors"
            >
              <ChevronsDown className="w-3.5 h-3.5" />
              Derrière
            </button>
          </div>
        </PropGroup>

        {/* Position */}
        <PropGroup label="Position (%)">
          <div className="grid grid-cols-2 gap-1.5">
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 w-3">X</span>
              <input
                type="number"
                value={Math.round(element.x * 10) / 10}
                onChange={(e) => u("x", parseFloat(e.target.value) || 0)}
                className="flex-1 px-1.5 py-1 rounded border border-gray-200 text-xs w-full"
                step={0.5}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 w-3">Y</span>
              <input
                type="number"
                value={Math.round(element.y * 10) / 10}
                onChange={(e) => u("y", parseFloat(e.target.value) || 0)}
                className="flex-1 px-1.5 py-1 rounded border border-gray-200 text-xs w-full"
                step={0.5}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 w-3">W</span>
              <input
                type="number"
                value={Math.round(element.width * 10) / 10}
                onChange={(e) => u("width", parseFloat(e.target.value) || 1)}
                className="flex-1 px-1.5 py-1 rounded border border-gray-200 text-xs w-full"
                step={0.5}
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 w-3">H</span>
              <input
                type="number"
                value={Math.round(element.height * 10) / 10}
                onChange={(e) => u("height", parseFloat(e.target.value) || 1)}
                className="flex-1 px-1.5 py-1 rounded border border-gray-200 text-xs w-full"
                step={0.5}
              />
            </div>
          </div>
        </PropGroup>
      </div>

      {/* ── ACTIONS ── */}
      <div className="border-t border-gray-100 pt-3 flex gap-2">
        <button
          onClick={onDuplicate}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          Dupliquer
        </button>
        <button
          onClick={onDelete}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-red-200 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Supprimer
        </button>
      </div>
    </div>
  );
}

/* ─── Small utility component ─── */
function PropGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1 block">
        {label}
      </label>
      {children}
    </div>
  );
}
