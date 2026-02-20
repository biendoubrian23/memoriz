"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ImageIcon,
  LayoutGrid,
  ImagePlus,
  Plus,
  X,
  Paintbrush,
} from "lucide-react";
import type {
  ProjectPage,
  LayoutTemplate,
  GridCell,
  PageElement,
} from "@/lib/types/editor";

/* ─── Props ─── */
type Props = {
  pages: ProjectPage[];
  layouts: LayoutTemplate[];
  activePage: number;
  onSelectPage: (index: number) => void;
  onPageAction: (pageIndex: number, action: "photos" | "layout" | "designer") => void;
  onRemoveElement: (elementId: string) => void;
  onDropPhoto?: (pageIndex: number, cellIndex: number, photoData: string) => void;
  onAddPage?: () => void;
  formatDimensions?: { width_cm: number; height_cm: number };
};

const MIN_CONTENT_PAGES = 26; // 13 spreads minimum

type SpreadEntry = { page: ProjectPage; idx: number } | null;

/* ═══════════════════════════════════════════════════════════════
   Main component — Scrollable grid of all book pages
   ═══════════════════════════════════════════════════════════════ */
export default function PageCanvas({
  pages,
  layouts,
  activePage,
  onSelectPage,
  onPageAction,
  onRemoveElement,
  onDropPhoto,
  onAddPage,
  formatDimensions,
}: Props) {
  const [coverView, setCoverView] = useState<"front" | "back">("front");

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-medium-gray text-sm">Aucune page dans ce projet</p>
      </div>
    );
  }

  /* ── Format-aware dimensions ── */
  const dims = formatDimensions ?? { width_cm: 21, height_cm: 29.7 };
  const isLandscape = dims.width_cm > dims.height_cm;
  const SCALE = 10; // px per cm
  const pageWidthPx = Math.round(dims.width_cm * SCALE);
  const spreadWidthPx = pageWidthPx * 2 + 3;
  const pageAspectRatio = `${dims.width_cm} / ${dims.height_cm}`;

  /* ── Separate page types ── */
  const coverIdx = pages.findIndex((p) => p.page_type === "cover");
  const backCoverIdx = pages.findIndex((p) => p.page_type === "back_cover");

  const contentEntries = pages
    .map((page, idx) => ({ page, idx }))
    .filter(
      ({ page }) =>
        page.page_type !== "cover" && page.page_type !== "back_cover"
    );

  /* ── Group content pages into spreads (pairs) ── */
  const spreads: { left: SpreadEntry; right: SpreadEntry }[] = [];
  for (let i = 0; i < contentEntries.length; i += 2) {
    spreads.push({
      left: contentEntries[i] ?? null,
      right: contentEntries[i + 1] ?? null,
    });
  }

  /* ── Group spreads into rows ── */
  const COLS = isLandscape ? 2 : 3;
  const rows: { left: SpreadEntry; right: SpreadEntry }[][] = [];
  for (let i = 0; i < spreads.length; i += COLS) {
    rows.push(spreads.slice(i, i + COLS));
  }

  const contentPageCount = contentEntries.length;
  const isAtMinimum = contentPageCount <= MIN_CONTENT_PAGES;

  const getLayout = (p: ProjectPage) =>
    layouts.find((l) => l.id === p.layout_id) ?? null;

  const showCoverPage = coverView === "front" ? coverIdx : backCoverIdx;

  return (
    <div className="flex flex-col items-center gap-10 w-full px-6 pb-12">
      {/* ────────── COVER SECTION ────────── */}
      {(coverIdx >= 0 || backCoverIdx >= 0) && (
        <section className="flex flex-col items-center gap-3 pt-2">
          {/* Tabs: Couverture / Dos de couverture */}
          <div className="flex items-center gap-6">
            {coverIdx >= 0 && (
              <button
                onClick={() => setCoverView("front")}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                  coverView === "front"
                    ? "text-blue-600 border-blue-600"
                    : "text-medium-gray/60 border-transparent hover:text-medium-gray"
                }`}
              >
                Couverture
              </button>
            )}
            {backCoverIdx >= 0 && (
              <button
                onClick={() => setCoverView("back")}
                className={`text-sm font-semibold pb-1 border-b-2 transition-colors ${
                  coverView === "back"
                    ? "text-blue-600 border-blue-600"
                    : "text-medium-gray/60 border-transparent hover:text-medium-gray"
                }`}
              >
                Dos de couverture
              </button>
            )}
          </div>

          {/* Cover card */}
          {showCoverPage >= 0 && (
            <div
              className="group/page relative cursor-pointer"
              style={{ width: pageWidthPx }}
              onClick={() => onSelectPage(showCoverPage)}
            >
              <div
                className="relative rounded-xl overflow-hidden ring-1 ring-black/5"
                style={{
                  aspectRatio: pageAspectRatio,
                  backgroundColor:
                    pages[showCoverPage].background_color || "#FFFFFF",
                  boxShadow:
                    "0 10px 40px rgba(0,0,0,0.10), 0 2px 10px rgba(0,0,0,0.06)",
                }}
              >
                <PageContent
                  page={pages[showCoverPage]}
                  layout={getLayout(pages[showCoverPage])}
                  pageIndex={showCoverPage}
                  onRemoveElement={onRemoveElement}
                  onDropPhoto={onDropPhoto}
                />
                <PageHoverOverlay
                  onAddPhotos={() => onPageAction(showCoverPage, "photos")}
                  onLayout={() => onPageAction(showCoverPage, "layout")}
                  onDesigner={() => onPageAction(showCoverPage, "designer")}
                />
              </div>
              {activePage === showCoverPage && (
                <div className="absolute inset-0 rounded-xl ring-2 ring-blue-500 pointer-events-none" />
              )}
            </div>
          )}
        </section>
      )}

      {/* ────────── SPREADS GRID ────────── */}
      {rows.length > 0 ? (
        <div className="w-full flex flex-col gap-6">
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex flex-col">
              {/* Row of spreads */}
              <div className="flex items-start justify-center gap-8">
                {row.map((spread, colIdx) => {
                  const globalSpreadIdx = rowIdx * COLS + colIdx;
                  return (
                    <SpreadBlock
                      key={globalSpreadIdx}
                      spread={spread}
                      activePage={activePage}
                      getLayout={getLayout}
                      onSelectPage={onSelectPage}
                      onPageAction={onPageAction}
                      onRemoveElement={onRemoveElement}
                      onDropPhoto={onDropPhoto}
                      spreadWidthPx={spreadWidthPx}
                      pageAspectRatio={pageAspectRatio}
                    />
                  );
                })}
              </div>

              {/* Separator "+" between rows */}
              {rowIdx < rows.length - 1 && (
                <div className="flex justify-center items-center h-8">
                  <button
                    onClick={onAddPage}
                    className="w-6 h-6 flex items-center justify-center rounded-full text-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Ajouter des pages"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <ImageIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-400">
            Ajoutez des pages pour commencer
          </p>
        </div>
      )}

      {/* ────────── BOTTOM ACTIONS ────────── */}
      <div className="flex flex-col items-center gap-3 pt-4">
        {!isAtMinimum && (
          <button
            onClick={onAddPage}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter des pages
          </button>
        )}
        <p className="text-xs text-center text-gray-500">
          {isAtMinimum ? (
            <>
              Cet album compte <strong>{contentPageCount} pages</strong>, soit le minimum requis.
              <br />
              Aucune page ne peut être supprimée.
            </>
          ) : (
            <>Cet album compte <strong>{contentPageCount} pages</strong>.</>
          )}
        </p>
        {isAtMinimum && (
          <button
            onClick={onAddPage}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter des pages
          </button>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════════════════════════ */

/* ── Page label ── */
function getPageLabel(page: ProjectPage): string {
  switch (page.page_type) {
    case "cover":
      return "Couverture";
    case "back_cover":
      return "4ème couv.";
    case "title":
      return "Page de garde";
    default:
      return `Page ${page.page_number}`;
  }
}

/* ── A complete spread: labels + left page + spine + right page ── */
function SpreadBlock({
  spread,
  activePage,
  getLayout,
  onSelectPage,
  onPageAction,
  onRemoveElement,
  onDropPhoto,
  spreadWidthPx,
  pageAspectRatio,
}: {
  spread: { left: SpreadEntry; right: SpreadEntry };
  activePage: number;
  getLayout: (p: ProjectPage) => LayoutTemplate | null;
  onSelectPage: (idx: number) => void;
  onPageAction: (idx: number, action: "photos" | "layout" | "designer") => void;
  onRemoveElement: (id: string) => void;
  onDropPhoto?: (pageIndex: number, cellIndex: number, photoData: string) => void;
  spreadWidthPx: number;
  pageAspectRatio: string;
}) {
  return (
    <div className="flex flex-col">
      {/* Page labels */}
      <div className="flex mb-1">
        <div className="flex-1 min-w-0">
          {spread.left && (
            <span className="text-[11px] font-medium text-gray-500 truncate block pl-1">
              {getPageLabel(spread.left.page)}
            </span>
          )}
        </div>
        <div className="w-1 shrink-0" />
        <div className="flex-1 min-w-0">
          {spread.right && (
            <span className="text-[11px] font-medium text-gray-500 truncate block pl-1">
              {getPageLabel(spread.right.page)}
            </span>
          )}
        </div>
      </div>

      {/* Book spread */}
      <div className="flex" style={{ width: spreadWidthPx }}>
        {/* Left page */}
        <SpreadPage
          entry={spread.left}
          side="left"
          isActive={spread.left?.idx === activePage}
          getLayout={getLayout}
          onSelectPage={onSelectPage}
          onPageAction={onPageAction}
          onRemoveElement={onRemoveElement}
          onDropPhoto={onDropPhoto}
          pageAspectRatio={pageAspectRatio}
        />

        {/* Spine */}
        <div
          className="w-[3px] shrink-0 relative z-10"
          style={{
            background:
              "linear-gradient(90deg, #d1d5db 0%, #e5e7eb 40%, #f3f4f6 50%, #e5e7eb 60%, #d1d5db 100%)",
          }}
        />

        {/* Right page */}
        <SpreadPage
          entry={spread.right}
          side="right"
          isActive={spread.right?.idx === activePage}
          getLayout={getLayout}
          onSelectPage={onSelectPage}
          onPageAction={onPageAction}
          onRemoveElement={onRemoveElement}
          onDropPhoto={onDropPhoto}
          pageAspectRatio={pageAspectRatio}
        />
      </div>
    </div>
  );
}

/* ── One side of an open book spread ── */
function SpreadPage({
  entry,
  side,
  isActive,
  getLayout,
  onSelectPage,
  onPageAction,
  onRemoveElement,
  onDropPhoto,
  pageAspectRatio,
}: {
  entry: SpreadEntry;
  side: "left" | "right";
  isActive: boolean;
  getLayout: (p: ProjectPage) => LayoutTemplate | null;
  onSelectPage: (idx: number) => void;
  onPageAction: (idx: number, action: "photos" | "layout" | "designer") => void;
  onRemoveElement: (id: string) => void;
  onDropPhoto?: (pageIndex: number, cellIndex: number, photoData: string) => void;
  pageAspectRatio: string;
}) {
  const borderRadius = side === "left" ? "rounded-l" : "rounded-r";

  if (!entry) {
    return (
      <div className={`flex-1 ${borderRadius} overflow-hidden`}>
        <div className="relative bg-gray-50 border border-dashed border-gray-200" style={{ aspectRatio: pageAspectRatio }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-xs text-gray-300">—</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group/page flex-1 ${borderRadius} overflow-hidden cursor-pointer relative`}
      onClick={() => onSelectPage(entry.idx)}
    >
      <div
        className="relative border border-dashed border-gray-200"
        style={{
          aspectRatio: pageAspectRatio,
          backgroundColor: entry.page.background_color || "#FFFFFF",
        }}
      >
        <PageContent
          page={entry.page}
          layout={getLayout(entry.page)}
          pageIndex={entry.idx}
          onRemoveElement={onRemoveElement}
          onDropPhoto={onDropPhoto}
        />
        <PageHoverOverlay
          onAddPhotos={() => onPageAction(entry.idx, "photos")}
          onLayout={() => onPageAction(entry.idx, "layout")}
          onDesigner={() => onPageAction(entry.idx, "designer")}
        />
      </div>
      {/* Active ring */}
      {isActive && (
        <div
          className={`absolute inset-0 ring-2 ring-blue-500 pointer-events-none z-20 ${borderRadius}`}
        />
      )}
    </div>
  );
}

/* ── Hover overlay with action buttons ── */
function PageHoverOverlay({
  onAddPhotos,
  onLayout,
  onDesigner,
}: {
  onAddPhotos: () => void;
  onLayout: () => void;
  onDesigner: () => void;
}) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-black/0 group-hover/page:bg-black/25 transition-all duration-200 pointer-events-none group-hover/page:pointer-events-auto">
      {/* Add photos */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAddPhotos();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-dark shadow-md
          opacity-0 -translate-y-2
          group-hover/page:opacity-100 group-hover/page:translate-y-0
          transition-all duration-200
          hover:bg-primary hover:text-white"
      >
        <ImagePlus className="w-3.5 h-3.5" />
        Ajouter des photos
      </button>

      {/* Mise en page */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onLayout();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-dark shadow-md
          opacity-0 translate-y-2
          group-hover/page:opacity-100 group-hover/page:translate-y-0
          transition-all duration-200 delay-75
          hover:bg-primary hover:text-white"
      >
        <LayoutGrid className="w-3.5 h-3.5" />
        Mise en page
      </button>

      {/* Designer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDesigner();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-dark shadow-md
          opacity-0 translate-y-2
          group-hover/page:opacity-100 group-hover/page:translate-y-0
          transition-all duration-200 delay-150
          hover:bg-accent hover:text-white"
      >
        <Paintbrush className="w-3.5 h-3.5" />
        Designer
      </button>
    </div>
  );
}

/* ── Page content renderer (layout cells + photos) ── */
function PageContent({
  page,
  layout,
  pageIndex,
  onRemoveElement,
  onDropPhoto,
}: {
  page: ProjectPage;
  layout: LayoutTemplate | null;
  pageIndex: number;
  onRemoveElement: (id: string) => void;
  onDropPhoto?: (pageIndex: number, cellIndex: number, photoData: string) => void;
}) {
  const [dragOverCell, setDragOverCell] = useState<number | null>(null);
  const cells = layout?.grid_config ?? [];
  const elements = page.elements ?? [];

  const getElement = (cell: GridCell, i: number): PageElement | undefined =>
    elements.find(
      (el) =>
        Math.abs(el.position_x - cell.x) < 2 &&
        Math.abs(el.position_y - cell.y) < 2
    ) ?? elements[i];

  if (cells.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <ImagePlus className="w-8 h-8 text-pink-300 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <>
      {cells.map((cell, i) => {
        const el = getElement(cell, i);
        const isTextCell = cell.type === "text";

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: `${cell.x}%`,
              top: `${cell.y}%`,
              width: `${cell.w}%`,
              height: `${cell.h}%`,
            }}
          >
            {isTextCell ? (
              /* ── Text zone ── */
              <div
                className="w-full h-full flex items-center overflow-hidden px-[4%]"
                style={{
                  justifyContent:
                    cell.textAlign === "right"
                      ? "flex-end"
                      : cell.textAlign === "center"
                      ? "center"
                      : "flex-start",
                }}
              >
                {el?.element_type === "text" && el.content ? (
                  <span
                    className="leading-tight truncate"
                    style={{
                      fontWeight: cell.fontWeight ?? "bold",
                      color: cell.textColor ?? "#000",
                      fontSize: `${cell.fontSize ?? 40}%`,
                    }}
                  >
                    {el.content}
                  </span>
                ) : (
                  <span
                    className="leading-tight truncate opacity-30"
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
              <div
                className="w-full h-full relative rounded-sm overflow-hidden group/cell"
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "copy";
                  setDragOverCell(i);
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  setDragOverCell(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverCell(null);
                  const data = e.dataTransfer.getData("application/memoriz-photo");
                  if (data && onDropPhoto) {
                    const photo = JSON.parse(data);
                    onDropPhoto(pageIndex, i, photo.publicUrl || photo.file_path);
                  }
                }}
              >
                <Image
                  src={el.content}
                  alt=""
                  fill
                  className="object-cover pointer-events-none"
                  sizes="300px"
                />
                {/* Drop overlay */}
                {dragOverCell === i && (
                  <div className="absolute inset-0 bg-primary/30 ring-2 ring-primary z-10 flex items-center justify-center">
                    <span className="text-white text-[10px] font-bold bg-primary/80 px-2 py-1 rounded-full shadow">
                      Remplacer
                    </span>
                  </div>
                )}
                <button
                  title="Supprimer"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveElement(el.id);
                  }}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center
                    opacity-0 group-hover/cell:opacity-100 transition-opacity shadow-md hover:bg-red-600 z-20"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div
                className={`w-full h-full border border-dashed rounded-sm flex items-center justify-center transition-colors ${
                  dragOverCell === i
                    ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                    : "border-gray-200 bg-gray-50/30"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  e.dataTransfer.dropEffect = "copy";
                  setDragOverCell(i);
                }}
                onDragLeave={(e) => {
                  e.stopPropagation();
                  setDragOverCell(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragOverCell(null);
                  const data = e.dataTransfer.getData("application/memoriz-photo");
                  if (data && onDropPhoto) {
                    const photo = JSON.parse(data);
                    onDropPhoto(pageIndex, i, photo.publicUrl || photo.file_path);
                  }
                }}
              >
                <ImagePlus className={`w-5 h-5 ${dragOverCell === i ? "text-primary" : "text-pink-300"}`} />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
