"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  X,
  ImagePlus,
  LayoutGrid,
  Type,
  Check,
  ImageIcon,
} from "lucide-react";
import type {
  ProjectPage,
  LayoutTemplate,
  GridCell,
  PageElement,
  UserPhoto,
} from "@/lib/types/editor";
import { isMagazineConfig } from "@/lib/types/editor";

type Props = {
  page: ProjectPage;
  layouts: LayoutTemplate[];
  photos: UserPhoto[];
  formatDimensions?: { width_cm: number; height_cm: number };
  onClose: () => void;
  onUpdateElement: (
    pageId: string,
    cellIndex: number,
    cell: GridCell,
    content: string,
    type: "image" | "text"
  ) => void;
  onSelectLayout: (layoutId: string) => void;
};

type DesignerTab = "layout" | "text";

export default function DesignerModal({
  page,
  layouts,
  photos,
  formatDimensions,
  onClose,
  onUpdateElement,
  onSelectLayout,
}: Props) {
  const [activeTab, setActiveTab] = useState<DesignerTab>("layout");
  const [editingCell, setEditingCell] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const textInputRef = useRef<HTMLTextAreaElement>(null);

  const dims = formatDimensions ?? { width_cm: 21, height_cm: 29.7 };
  const pageAspect = `${dims.width_cm} / ${dims.height_cm}`;

  const layout = layouts.find((l) => l.id === page.layout_id) ?? null;
  const cells: GridCell[] = (layout && !isMagazineConfig(layout.grid_config)) ? layout.grid_config : [];
  const elements = page.elements ?? [];

  const getElement = (cell: GridCell, i: number): PageElement | undefined =>
    elements.find(
      (el) =>
        Math.abs(el.position_x - cell.x) < 2 &&
        Math.abs(el.position_y - cell.y) < 2
    ) ?? elements[i];

  /* ── Start editing a text cell ── */
  const startEditText = useCallback(
    (cellIdx: number, cell: GridCell) => {
      const el = getElement(cell, cellIdx);
      setEditingCell(cellIdx);
      setTextValue(el?.element_type === "text" ? el.content : "");
      setTimeout(() => textInputRef.current?.focus(), 50);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [elements]
  );

  /* ── Confirm text edit ── */
  const confirmText = useCallback(() => {
    if (editingCell === null) return;
    const cell = cells[editingCell];
    if (cell) {
      onUpdateElement(page.id, editingCell, cell, textValue, "text");
    }
    setEditingCell(null);
    setTextValue("");
  }, [editingCell, cells, page.id, textValue, onUpdateElement]);

  /* ── Add photo to a cell ── */
  const addPhotoToCell = useCallback(
    (cellIdx: number, cell: GridCell, photo: UserPhoto) => {
      onUpdateElement(
        page.id,
        cellIdx,
        cell,
        photo.publicUrl ?? photo.file_path,
        "image"
      );
    },
    [page.id, onUpdateElement]
  );

  /* ── Escape to close ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (editingCell !== null) {
          setEditingCell(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose, editingCell]);

  /* ── Filter layouts by category ── */
  const contentLayouts = layouts.filter(
    (l) => l.category === "standard" || l.category === "mixed" || l.category === "magazine"
  );

  const getPageLabel = () => {
    if (page.page_type === "cover") return "Couverture";
    if (page.page_type === "back_cover") return "4ème de couverture";
    return `Page ${page.page_number}`;
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/95 flex animate-fade-in">
      {/* ── Left side: Page canvas (large) ── */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 max-h-full">
          <h2 className="text-white text-lg font-semibold">
            Designer — {getPageLabel()}
          </h2>

          {/* The page */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              aspectRatio: pageAspect,
              height: "75vh",
              backgroundColor: page.background_color || "#FFFFFF",
            }}
          >
            {cells.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Choisissez une mise en page →
                  </p>
                </div>
              </div>
            ) : (
              cells.map((cell, i) => {
                const el = getElement(cell, i);
                const isTextCell = cell.type === "text";
                const isEditing = editingCell === i;

                return (
                  <div
                    key={i}
                    className="absolute group/dcell"
                    style={{
                      left: `${cell.x}%`,
                      top: `${cell.y}%`,
                      width: `${cell.w}%`,
                      height: `${cell.h}%`,
                    }}
                  >
                    {isTextCell ? (
                      /* ── TEXT CELL ── */
                      <div
                        className={`w-full h-full flex items-center cursor-pointer transition-all px-[4%] ${
                          isEditing
                            ? "ring-2 ring-accent bg-white/10"
                            : "hover:ring-2 hover:ring-accent/50"
                        }`}
                        style={{
                          justifyContent:
                            cell.textAlign === "right"
                              ? "flex-end"
                              : cell.textAlign === "center"
                              ? "center"
                              : "flex-start",
                        }}
                        onClick={() => {
                          if (!isEditing) startEditText(i, cell);
                        }}
                      >
                        {isEditing ? (
                          <div className="w-full h-full flex items-center relative">
                            <textarea
                              ref={textInputRef}
                              value={textValue}
                              onChange={(e) => setTextValue(e.target.value)}
                              className="w-full h-full bg-transparent resize-none outline-none leading-tight"
                              style={{
                                fontWeight: cell.fontWeight ?? "bold",
                                color: cell.textColor ?? "#000",
                                fontSize: `${cell.fontSize ?? 40}%`,
                                textAlign: cell.textAlign ?? "left",
                              }}
                              placeholder={cell.placeholder ?? "Saisir du texte…"}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  confirmText();
                                }
                              }}
                            />
                            <button
                              onClick={confirmText}
                              className="absolute top-1 right-1 w-6 h-6 bg-accent text-white rounded-full flex items-center justify-center shadow-md hover:bg-accent/80 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : el?.element_type === "text" && el.content ? (
                          <span
                            className="leading-tight"
                            style={{
                              fontWeight: cell.fontWeight ?? "bold",
                              color: cell.textColor ?? "#000",
                              fontSize: `${cell.fontSize ?? 40}%`,
                              textAlign: cell.textAlign ?? "left",
                            }}
                          >
                            {el.content}
                          </span>
                        ) : (
                          <span
                            className="leading-tight opacity-30"
                            style={{
                              fontWeight: cell.fontWeight ?? "bold",
                              color: cell.textColor ?? "#999",
                              fontSize: `${cell.fontSize ?? 40}%`,
                            }}
                          >
                            {cell.placeholder ?? "Texte"}
                          </span>
                        )}
                      </div>
                    ) : el?.element_type === "image" ? (
                      /* ── IMAGE CELL with content ── */
                      <div className="w-full h-full relative rounded-sm overflow-hidden">
                        <Image
                          src={el.content}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="600px"
                        />
                      </div>
                    ) : (
                      /* ── EMPTY IMAGE CELL ── */
                      <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-sm flex items-center justify-center bg-gray-50/30 hover:border-primary/50 hover:bg-primary/5 transition-colors">
                        <ImagePlus className="w-8 h-8 text-pink-300" />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── Right sidebar ── */}
      <div className="w-80 bg-white flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
          <h3 className="text-sm font-bold text-dark">Designer</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-dark hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 shrink-0">
          <button
            onClick={() => setActiveTab("layout")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === "layout"
                ? "text-primary border-primary"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Mises en page
          </button>
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-colors border-b-2 ${
              activeTab === "text"
                ? "text-primary border-primary"
                : "text-gray-400 border-transparent hover:text-gray-600"
            }`}
          >
            <Type className="w-4 h-4" />
            Photos
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === "layout" && (
            <div>
              <p className="text-xs text-gray-500 mb-3 uppercase font-semibold tracking-wider">
                Choisir un template
              </p>
              <div className="grid grid-cols-2 gap-2">
                {contentLayouts.map((ly) => {
                  const isSelected = page.layout_id === ly.id;
                  const hasMagazineStyle = ly.category === "magazine";
                  return (
                    <TemplateCard
                      key={ly.id}
                      layout={ly}
                      isSelected={isSelected}
                      hasMagazineStyle={hasMagazineStyle}
                      onClick={() => onSelectLayout(ly.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === "text" && (
            <div>
              <p className="text-xs text-gray-500 mb-3 uppercase font-semibold tracking-wider">
                Vos photos
              </p>
              {photos.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">
                  Aucune photo uploadée
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => {
                        /* find first empty image cell */
                        const emptyCellIdx = cells.findIndex((c, idx) => {
                          if (c.type === "text") return false;
                          const el = getElement(c, idx);
                          return !el || el.element_type !== "image";
                        });
                        if (emptyCellIdx >= 0) {
                          addPhotoToCell(
                            emptyCellIdx,
                            cells[emptyCellIdx],
                            photo
                          );
                        }
                      }}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-primary transition-colors group"
                    >
                      <Image
                        src={photo.publicUrl ?? ""}
                        alt={photo.file_name}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <span className="text-white text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Ajouter
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   TemplateCard — with hover preview tooltip
   ═════════════════════════════════════════════ */
function TemplateCard({
  layout,
  isSelected,
  hasMagazineStyle,
  onClick,
}: {
  layout: LayoutTemplate;
  isSelected: boolean;
  hasMagazineStyle: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (hovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.left - 12,
      });
    }
  }, [hovered]);

  return (
    <>
      <button
        ref={cardRef}
        onClick={onClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`relative aspect-[3/4] rounded-lg border-2 p-1.5 transition-all hover:shadow-md ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-gray-100 hover:border-gray-300"
        }`}
      >
        {/* Mini preview */}
        <div className="w-full h-full relative bg-white rounded overflow-hidden">
          {isMagazineConfig(layout.grid_config) ? (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
              <span className="text-[8px] font-bold text-purple-400 uppercase tracking-wider">Magazine</span>
            </div>
          ) : layout.grid_config.map((cell: GridCell, i: number) => (
            <div
              key={i}
              className={`absolute rounded-sm ${
                cell.type === "text"
                  ? "flex items-center justify-center"
                  : "bg-gray-200"
              }`}
              style={{
                left: `${cell.x}%`,
                top: `${cell.y}%`,
                width: `${cell.w}%`,
                height: `${cell.h}%`,
                backgroundColor:
                  cell.type === "text" ? "transparent" : undefined,
              }}
            >
              {cell.type === "text" && (
                <div
                  className="w-[80%] rounded-sm"
                  style={{
                    height: `${Math.min(cell.fontSize ?? 40, 60)}%`,
                    backgroundColor: cell.textColor ?? "#ccc",
                    opacity: 0.25,
                  }}
                />
              )}
            </div>
          ))}
          {hasMagazineStyle && (
            <div className="absolute bottom-0.5 right-0.5 bg-accent/90 text-white text-[7px] font-bold px-1 py-0.5 rounded">
              MAG
            </div>
          )}
        </div>
        <span className="absolute bottom-0.5 left-0.5 right-0.5 text-[8px] text-center text-gray-500 truncate">
          {layout.name}
        </span>
        {isSelected && (
          <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <svg
              className="w-2.5 h-2.5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={4}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
      </button>

      {/* ── Hover preview tooltip (large) ── */}
      {hovered && (
        <div
          className="fixed z-[100] pointer-events-none animate-fade-in"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: "translate(-100%, -50%)",
          }}
        >
          <div className="w-56 bg-white rounded-xl shadow-2xl border border-gray-200 p-3">
            <div className="w-full aspect-[3/4] relative bg-gray-50 rounded-lg overflow-hidden mb-2">
              {isMagazineConfig(layout.grid_config) ? (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
                  <div className="text-center">
                    <span className="block text-sm font-bold text-purple-500">✨</span>
                    <span className="text-[10px] font-semibold text-purple-400">Magazine</span>
                  </div>
                </div>
              ) : layout.grid_config.map((cell: GridCell, i: number) => (
                <div
                  key={i}
                  className={`absolute rounded-sm ${
                    cell.type === "text" ? "" : "bg-gray-200"
                  }`}
                  style={{
                    left: `${cell.x}%`,
                    top: `${cell.y}%`,
                    width: `${cell.w}%`,
                    height: `${cell.h}%`,
                  }}
                >
                  {cell.type === "text" && (
                    <div className="w-full h-full flex items-center px-[6%]">
                      <span
                        className="truncate opacity-40 leading-none"
                        style={{
                          fontWeight: cell.fontWeight ?? "bold",
                          fontSize: `${(cell.fontSize ?? 40) * 0.4}%`,
                          color: cell.textColor ?? "#000",
                          textAlign: cell.textAlign ?? "left",
                        }}
                      >
                        {cell.placeholder ?? "Texte"}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-xs font-semibold text-dark text-center truncate">
              {layout.name}
            </p>
            <p className="text-[10px] text-gray-400 text-center">
              {layout.photo_count} photo
              {layout.photo_count > 1 ? "s" : ""}
              {!isMagazineConfig(layout.grid_config) && layout.grid_config.some((c) => c.type === "text") &&
                " + texte"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
