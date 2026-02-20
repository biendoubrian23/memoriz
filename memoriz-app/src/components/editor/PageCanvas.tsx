"use client";

import Image from "next/image";
import { X, ImageIcon } from "lucide-react";
import type { ProjectPage, LayoutTemplate, GridCell, PageElement } from "@/lib/types/editor";

type Props = {
  page: ProjectPage | undefined;
  layout: LayoutTemplate | null;
  onRemoveElement: (elementId: string) => void;
};

export default function PageCanvas({ page, layout, onRemoveElement }: Props) {
  if (!page) {
    return (
      <div className="w-full max-w-2xl aspect-[3/4] bg-white rounded-xl shadow-lg flex items-center justify-center">
        <p className="text-medium-gray">Sélectionnez une page</p>
      </div>
    );
  }

  const cells = layout?.grid_config ?? [];
  const elements = page.elements ?? [];

  // Map elements to their cells (by position matching or index)
  const getElementForCell = (cell: GridCell, cellIndex: number): PageElement | undefined => {
    return elements.find(
      (el) =>
        Math.abs(el.position_x - cell.x) < 2 &&
        Math.abs(el.position_y - cell.y) < 2
    ) ?? elements[cellIndex];
  };

  return (
    <div className="relative w-full max-w-2xl">
      {/* Page type label */}
      <div className="absolute -top-8 left-0 text-xs font-medium text-medium-gray uppercase tracking-wider">
        {page.page_type === "cover"
          ? "Couverture"
          : page.page_type === "back_cover"
          ? "4ème de couverture"
          : `Page ${page.page_number}`}
      </div>

      {/* The page */}
      <div
        className="w-full aspect-[3/4] rounded-xl shadow-xl overflow-hidden relative"
        style={{ backgroundColor: page.background_color || "#FFFFFF" }}
      >
        {cells.length === 0 ? (
          /* Empty layout — show placeholder */
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <ImageIcon className="w-16 h-16 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">Choisissez une mise en page</p>
            </div>
          </div>
        ) : (
          /* Render cells */
          cells.map((cell, i) => {
            const element = getElementForCell(cell, i);
            return (
              <div
                key={i}
                className="absolute group"
                style={{
                  left: `${cell.x}%`,
                  top: `${cell.y}%`,
                  width: `${cell.w}%`,
                  height: `${cell.h}%`,
                }}
              >
                {element && element.element_type === "image" ? (
                  /* Photo cell */
                  <div className="w-full h-full relative rounded-sm overflow-hidden">
                    <Image
                      src={element.content}
                      alt="Photo"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    {/* Remove button on hover */}
                    <button
                      onClick={() => onRemoveElement(element.id)}
                      className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* Empty cell placeholder */
                  <div className="w-full h-full border-2 border-dashed border-gray-200 rounded-sm flex items-center justify-center bg-gray-50/50 hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                    <div className="text-center">
                      <ImageIcon className="w-8 h-8 text-gray-300 mx-auto mb-1" />
                      <span className="text-xs text-gray-400">
                        Glissez une photo
                      </span>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
