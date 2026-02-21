"use client";

/* ─────────────────────────────────────────────────────────────
   PropertyPanel — Right-side panel showing selected object props
   Like Canva's right panel: position, size, rotation, text props
   ───────────────────────────────────────────────────────────── */

import { useState, useEffect, useCallback } from "react";
import * as fabric from "fabric";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ChevronDown,
} from "lucide-react";
import { GOOGLE_FONTS, loadFont } from "@/lib/template-editor/font-loader";
import { FILTER_PRESETS, applyAdjustments } from "@/lib/template-editor/filters";
import type { CanvasEditorHandle } from "./CanvasEditor";

type Props = {
  selectedObject: fabric.FabricObject | null;
  editorRef: React.RefObject<CanvasEditorHandle | null>;
};

export default function TemplatePropertyPanel({ selectedObject, editorRef }: Props) {
  const [, forceUpdate] = useState(0);
  const refresh = useCallback(() => forceUpdate((n) => n + 1), []);

  // Force refresh when object changes
  useEffect(() => {
    refresh();
  }, [selectedObject, refresh]);

  if (!selectedObject) {
    return (
      <div className="w-72 bg-white border-l border-gray-200 p-4 flex items-center justify-center h-full">
        <p className="text-sm text-gray-400 text-center">
          Sélectionnez un élément<br />pour voir ses propriétés
        </p>
      </div>
    );
  }

  const isText =
    selectedObject instanceof fabric.Textbox ||
    selectedObject instanceof fabric.IText ||
    selectedObject instanceof fabric.FabricText;

  const isImage = selectedObject instanceof fabric.FabricImage;

  const updateAndRefresh = (props: Record<string, unknown>) => {
    selectedObject.set(props);
    editorRef.current?.getCanvas()?.requestRenderAll();
    editorRef.current?.getHistory()?.saveState();
    refresh();
  };

  return (
    <div className="w-72 bg-white border-l border-gray-200 overflow-y-auto h-full">
      <div className="p-4 space-y-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Propriétés
        </h3>

        {/* ── Position & Size ── */}
        <Section title="Position & Taille">
          <div className="grid grid-cols-2 gap-2">
            <NumInput label="X" value={Math.round(selectedObject.left ?? 0)} onChange={(v) => updateAndRefresh({ left: v })} />
            <NumInput label="Y" value={Math.round(selectedObject.top ?? 0)} onChange={(v) => updateAndRefresh({ top: v })} />
            <NumInput label="L" value={Math.round((selectedObject.width ?? 0) * (selectedObject.scaleX ?? 1))} onChange={(v) => {
              const newScale = v / (selectedObject.width ?? 1);
              updateAndRefresh({ scaleX: newScale });
            }} />
            <NumInput label="H" value={Math.round((selectedObject.height ?? 0) * (selectedObject.scaleY ?? 1))} onChange={(v) => {
              const newScale = v / (selectedObject.height ?? 1);
              updateAndRefresh({ scaleY: newScale });
            }} />
          </div>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <NumInput label="Rotation" value={Math.round(selectedObject.angle ?? 0)} onChange={(v) => updateAndRefresh({ angle: v })} suffix="°" />
            <NumInput label="Opacité" value={Math.round((selectedObject.opacity ?? 1) * 100)} onChange={(v) => updateAndRefresh({ opacity: v / 100 })} suffix="%" min={0} max={100} />
          </div>
        </Section>

        {/* ── Text Properties ── */}
        {isText && (
          <>
            <Section title="Texte">
              {/* Font family */}
              <div className="space-y-2">
                <label className="text-[11px] text-gray-500 font-medium">Police</label>
                <FontSelect
                  value={(selectedObject as fabric.Textbox).fontFamily ?? "Poppins"}
                  onChange={(family) => {
                    loadFont(family);
                    updateAndRefresh({ fontFamily: family });
                  }}
                />
              </div>

              {/* Font size */}
              <div className="mt-2">
                <NumInput
                  label="Taille"
                  value={Math.round((selectedObject as fabric.Textbox).fontSize ?? 16)}
                  onChange={(v) => updateAndRefresh({ fontSize: v })}
                  suffix="px"
                  min={1}
                  max={500}
                />
              </div>

              {/* Bold / Italic / Underline / Strike */}
              <div className="flex gap-1 mt-2">
                <ToggleButton
                  icon={Bold}
                  active={(selectedObject as fabric.Textbox).fontWeight === "bold"}
                  onClick={() =>
                    updateAndRefresh({
                      fontWeight: (selectedObject as fabric.Textbox).fontWeight === "bold" ? "normal" : "bold",
                    })
                  }
                  title="Gras"
                />
                <ToggleButton
                  icon={Italic}
                  active={(selectedObject as fabric.Textbox).fontStyle === "italic"}
                  onClick={() =>
                    updateAndRefresh({
                      fontStyle: (selectedObject as fabric.Textbox).fontStyle === "italic" ? "normal" : "italic",
                    })
                  }
                  title="Italique"
                />
                <ToggleButton
                  icon={Underline}
                  active={(selectedObject as fabric.Textbox).underline === true}
                  onClick={() =>
                    updateAndRefresh({ underline: !(selectedObject as fabric.Textbox).underline })
                  }
                  title="Souligné"
                />
                <ToggleButton
                  icon={Strikethrough}
                  active={(selectedObject as fabric.Textbox).linethrough === true}
                  onClick={() =>
                    updateAndRefresh({ linethrough: !(selectedObject as fabric.Textbox).linethrough })
                  }
                  title="Barré"
                />
              </div>

              {/* Text alignment */}
              <div className="flex gap-1 mt-2">
                <ToggleButton icon={AlignLeft} active={(selectedObject as fabric.Textbox).textAlign === "left"} onClick={() => updateAndRefresh({ textAlign: "left" })} title="Gauche" />
                <ToggleButton icon={AlignCenter} active={(selectedObject as fabric.Textbox).textAlign === "center"} onClick={() => updateAndRefresh({ textAlign: "center" })} title="Centre" />
                <ToggleButton icon={AlignRight} active={(selectedObject as fabric.Textbox).textAlign === "right"} onClick={() => updateAndRefresh({ textAlign: "right" })} title="Droite" />
                <ToggleButton icon={AlignJustify} active={(selectedObject as fabric.Textbox).textAlign === "justify"} onClick={() => updateAndRefresh({ textAlign: "justify" })} title="Justifié" />
              </div>

              {/* Text color */}
              <div className="mt-3">
                <label className="text-[11px] text-gray-500 font-medium block mb-1">Couleur du texte</label>
                <ColorInput
                  value={((selectedObject as fabric.Textbox).fill as string) ?? "#000000"}
                  onChange={(color) => updateAndRefresh({ fill: color })}
                />
              </div>

              {/* Letter spacing */}
              <div className="mt-2">
                <RangeInput
                  label="Espacement lettres"
                  value={(selectedObject as fabric.Textbox).charSpacing ?? 0}
                  onChange={(v) => updateAndRefresh({ charSpacing: v })}
                  min={-200}
                  max={800}
                  step={10}
                />
              </div>

              {/* Line height */}
              <div className="mt-2">
                <RangeInput
                  label="Interligne"
                  value={(selectedObject as fabric.Textbox).lineHeight ?? 1.2}
                  onChange={(v) => updateAndRefresh({ lineHeight: v })}
                  min={0.5}
                  max={3}
                  step={0.05}
                  display={(v) => v.toFixed(2)}
                />
              </div>

              {/* Text transform (uppercase) */}
              <div className="mt-2 flex gap-1">
                {[
                  { label: "Aa", value: "none" },
                  { label: "AA", value: "uppercase" },
                  { label: "aa", value: "lowercase" },
                ].map((opt) => {
                  // Text transform must be done manually for Fabric
                  return (
                    <button
                      key={opt.value}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        false // Can't directly check textTransform in fabricjs
                          ? "border-purple-500 bg-purple-50 text-purple-700"
                          : "border-gray-200 text-gray-600 hover:border-purple-300"
                      }`}
                      onClick={() => {
                        const tb = selectedObject as fabric.Textbox;
                        let text = tb.text ?? "";
                        if (opt.value === "uppercase") text = text.toUpperCase();
                        else if (opt.value === "lowercase") text = text.toLowerCase();
                        updateAndRefresh({ text });
                      }}
                      title={opt.value}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Text shadow */}
              <div className="mt-3">
                <label className="text-[11px] text-gray-500 font-medium block mb-1">Ombre</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateAndRefresh({ shadow: null })}
                    className="flex-1 py-1.5 text-xs rounded-lg border border-gray-200 hover:border-purple-300"
                  >
                    Aucune
                  </button>
                  <button
                    onClick={() =>
                      updateAndRefresh({
                        shadow: new fabric.Shadow({
                          color: "rgba(0,0,0,0.4)",
                          blur: 8,
                          offsetX: 2,
                          offsetY: 2,
                        }),
                      })
                    }
                    className="flex-1 py-1.5 text-xs rounded-lg border border-gray-200 hover:border-purple-300"
                  >
                    Légère
                  </button>
                  <button
                    onClick={() =>
                      updateAndRefresh({
                        shadow: new fabric.Shadow({
                          color: "rgba(0,0,0,0.7)",
                          blur: 15,
                          offsetX: 3,
                          offsetY: 3,
                        }),
                      })
                    }
                    className="flex-1 py-1.5 text-xs rounded-lg border border-gray-200 hover:border-purple-300"
                  >
                    Forte
                  </button>
                </div>
              </div>
            </Section>
          </>
        )}

        {/* ── Image Properties ── */}
        {isImage && (
          <Section title="Image">
            {/* Filters */}
            <label className="text-[11px] text-gray-500 font-medium block mb-2">Filtres</label>
            <div className="grid grid-cols-3 gap-1.5">
              {FILTER_PRESETS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => {
                    filter.apply(selectedObject as fabric.FabricImage);
                    editorRef.current?.getCanvas()?.requestRenderAll();
                    editorRef.current?.getHistory()?.saveState();
                  }}
                  className="py-1.5 px-1 text-[10px] rounded-lg border border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-colors truncate"
                >
                  {filter.name}
                </button>
              ))}
            </div>

            {/* Adjustments */}
            <div className="mt-3 space-y-2">
              <RangeInput
                label="Luminosité"
                value={0}
                onChange={(v) => {
                  applyAdjustments(selectedObject as fabric.FabricImage, { brightness: v });
                  editorRef.current?.getCanvas()?.requestRenderAll();
                }}
                min={-1}
                max={1}
                step={0.05}
                display={(v) => `${Math.round(v * 100)}%`}
              />
              <RangeInput
                label="Contraste"
                value={0}
                onChange={(v) => {
                  applyAdjustments(selectedObject as fabric.FabricImage, { contrast: v });
                  editorRef.current?.getCanvas()?.requestRenderAll();
                }}
                min={-1}
                max={1}
                step={0.05}
                display={(v) => `${Math.round(v * 100)}%`}
              />
              <RangeInput
                label="Saturation"
                value={0}
                onChange={(v) => {
                  applyAdjustments(selectedObject as fabric.FabricImage, { saturation: v });
                  editorRef.current?.getCanvas()?.requestRenderAll();
                }}
                min={-1}
                max={1}
                step={0.05}
                display={(v) => `${Math.round(v * 100)}%`}
              />
            </div>

            {/* Border radius */}
            <div className="mt-2">
              <RangeInput
                label="Coins arrondis"
                value={0}
                onChange={(v) => {
                  // Use clipPath for border-radius on images
                  const obj = selectedObject as fabric.FabricObject;
                  if (v > 0) {
                    const w = (obj.width ?? 0) * (obj.scaleX ?? 1);
                    const h = (obj.height ?? 0) * (obj.scaleY ?? 1);
                    const shape = new fabric.Rect({
                      width: w,
                      height: h,
                      rx: v,
                      ry: v,
                      left: -w / 2,
                      top: -h / 2,
                    });
                    obj.clipPath = shape;
                  } else {
                    obj.clipPath = undefined;
                  }
                  editorRef.current?.getCanvas()?.requestRenderAll();
                  editorRef.current?.getHistory()?.saveState();
                }}
                min={0}
                max={100}
              />
            </div>
          </Section>
        )}

        {/* ── Shape Properties ── */}
        {!isText && !isImage && (
          <Section title="Forme">
            {/* Fill color */}
            <div>
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Remplissage</label>
              <ColorInput
                value={(selectedObject.fill as string) ?? "#000000"}
                onChange={(color) => updateAndRefresh({ fill: color })}
              />
            </div>

            {/* Stroke */}
            <div className="mt-2">
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Bordure</label>
              <div className="flex gap-2 items-center">
                <ColorInput
                  value={(selectedObject.stroke as string) ?? "#000000"}
                  onChange={(color) => updateAndRefresh({ stroke: color })}
                />
                <NumInput
                  label="Ép."
                  value={selectedObject.strokeWidth ?? 0}
                  onChange={(v) => updateAndRefresh({ strokeWidth: v })}
                  min={0}
                  max={50}
                />
              </div>
            </div>

            {/* Border radius (for Rect) */}
            {selectedObject instanceof fabric.Rect && (
              <div className="mt-2">
                <RangeInput
                  label="Coins arrondis"
                  value={selectedObject.rx ?? 0}
                  onChange={(v) => updateAndRefresh({ rx: v, ry: v })}
                  min={0}
                  max={100}
                />
              </div>
            )}

            {/* Shadow */}
            <div className="mt-3">
              <label className="text-[11px] text-gray-500 font-medium block mb-1">Ombre</label>
              <div className="flex gap-1">
                <button onClick={() => updateAndRefresh({ shadow: null })} className="flex-1 py-1 text-[10px] rounded border border-gray-200 hover:border-purple-300">Aucune</button>
                <button onClick={() => updateAndRefresh({ shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.3)", blur: 10, offsetX: 3, offsetY: 3 }) })} className="flex-1 py-1 text-[10px] rounded border border-gray-200 hover:border-purple-300">Légère</button>
                <button onClick={() => updateAndRefresh({ shadow: new fabric.Shadow({ color: "rgba(0,0,0,0.6)", blur: 20, offsetX: 5, offsetY: 5 }) })} className="flex-1 py-1 text-[10px] rounded border border-gray-200 hover:border-purple-300">Forte</button>
              </div>
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

/* ═══════════ Sub-components ═══════════ */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="pb-4 border-b border-gray-100">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function NumInput({
  label,
  value,
  onChange,
  suffix = "",
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-gray-400 font-medium w-5 shrink-0">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          let v = parseInt(e.target.value) || 0;
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
        }}
        className="w-full bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-purple-400"
      />
      {suffix && <span className="text-[10px] text-gray-400">{suffix}</span>}
    </div>
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (color: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200"
        />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 text-xs text-gray-700 outline-none focus:border-purple-400 uppercase"
      />
    </div>
  );
}

function RangeInput({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  display,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  display?: (v: number) => string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-gray-500 font-medium">{label}</span>
        <span className="text-[10px] text-gray-400 tabular-nums">
          {display ? display(value) : value}
        </span>
      </div>
      <input
        type="range"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-purple-600"
      />
    </div>
  );
}

function ToggleButton({
  icon: Icon,
  active,
  onClick,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
        active
          ? "bg-purple-100 text-purple-700 border border-purple-300"
          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
    </button>
  );
}

function FontSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (family: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = search
    ? GOOGLE_FONTS.filter((f) => f.toLowerCase().includes(search.toLowerCase()))
    : GOOGLE_FONTS;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-left hover:border-purple-300 transition-colors"
      >
        <span className="truncate" style={{ fontFamily: value }}>
          {value}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-40 max-h-64 overflow-hidden flex flex-col">
            <div className="p-2 border-b border-gray-100">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full px-2 py-1.5 bg-gray-50 border border-gray-200 rounded text-xs outline-none focus:border-purple-400"
              />
            </div>
            <div className="overflow-y-auto max-h-48">
              {filtered.map((font) => (
                <button
                  key={font}
                  onClick={() => {
                    onChange(font);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-purple-50 transition-colors ${
                    font === value ? "bg-purple-50 text-purple-700 font-medium" : "text-gray-700"
                  }`}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
