"use client";

import { Plus, Trash2 } from "lucide-react";
import type { ProjectPage } from "@/lib/types/editor";

type Props = {
  pages: ProjectPage[];
  activePage: number;
  onSelectPage: (index: number) => void;
  onAddPage: () => void;
  onDeletePage: (pageId: string) => void;
};

function pageLabel(page: ProjectPage): string {
  switch (page.page_type) {
    case "cover":
      return "Couverture";
    case "back_cover":
      return "4ème";
    case "title":
      return "Titre";
    default:
      return `Page ${page.page_number}`;
  }
}

export default function PageThumbnails({
  pages,
  activePage,
  onSelectPage,
  onAddPage,
  onDeletePage,
}: Props) {
  return (
    <div className="h-28 bg-white border-t border-gray-200 shrink-0 flex items-center px-4 gap-3 overflow-x-auto">
      {pages.map((page, index) => (
        <div
          key={page.id}
          onClick={() => onSelectPage(index)}
          className={`relative group shrink-0 w-16 h-20 rounded-lg border-2 transition-all cursor-pointer ${
            index === activePage
              ? "border-primary shadow-md shadow-primary/20 scale-105"
              : "border-gray-200 hover:border-gray-300"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectPage(index); }}
        >
          {/* Mini page preview */}
          <div
            className="w-full h-full rounded-md flex items-center justify-center text-[9px] font-medium"
            style={{ backgroundColor: page.background_color || "#fff" }}
          >
            <span
              className={
                index === activePage ? "text-primary" : "text-gray-400"
              }
            >
              {pageLabel(page)}
            </span>
          </div>

          {/* Delete button (only for content pages) */}
          {page.page_type === "content" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeletePage(page.id);
              }}
              className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:bg-red-600"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}

      {/* Add page button */}
      <button
        onClick={onAddPage}
        className="shrink-0 w-16 h-20 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-primary hover:text-primary transition-colors"
      >
        <Plus className="w-5 h-5" />
        <span className="text-[9px] mt-0.5">Ajouter</span>
      </button>
    </div>
  );
}
