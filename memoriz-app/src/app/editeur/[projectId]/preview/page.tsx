"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ImageIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type { ProjectPage, LayoutTemplate, PageElement, GridCell } from "@/lib/types/editor";

export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { user, loading: authLoading } = useAuth();

  const [pages, setPages] = useState<ProjectPage[]>([]);
  const [layouts, setLayouts] = useState<LayoutTemplate[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState("");

  const supabase = createClient();

  const loadData = useCallback(async () => {
    if (!user) return;

    const [projectRes, pagesRes, layoutsRes] = await Promise.all([
      supabase.from("projects").select("title").eq("id", projectId).single(),
      supabase
        .from("project_pages")
        .select("*, page_elements(*)")
        .eq("project_id", projectId)
        .order("page_number"),
      supabase.from("layout_templates").select("*").order("display_order"),
    ]);

    if (projectRes.data) setProjectTitle(projectRes.data.title);
    if (pagesRes.data) {
      setPages(
        (pagesRes.data as (ProjectPage & { page_elements: PageElement[] })[]).map((p) => ({
          ...p,
          elements: p.page_elements ?? [],
        }))
      );
    }
    if (layoutsRes.data) {
      setLayouts(
        (layoutsRes.data as LayoutTemplate[]).map((l) => ({
          ...l,
          grid_config:
            typeof l.grid_config === "string" ? JSON.parse(l.grid_config) : l.grid_config,
        }))
      );
    }
    setLoading(false);
  }, [user, projectId, supabase]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrentPage((p) => Math.min(p + 1, pages.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentPage((p) => Math.max(p - 1, 0));
      } else if (e.key === "Escape") {
        router.push(`/editeur/${projectId}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [pages.length, projectId, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const page = pages[currentPage];
  const layout = page ? layouts.find((l) => l.id === page.layout_id) ?? null : null;
  const cells = layout?.grid_config ?? [];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-6 shrink-0">
        <button
          onClick={() => router.push(`/editeur/${projectId}`)}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="text-sm">Fermer l&apos;aperçu</span>
        </button>

        <h1 className="text-white font-medium text-sm">{projectTitle}</h1>

        <div className="flex items-center gap-3">
          <span className="text-white/50 text-sm">
            {currentPage + 1} / {pages.length}
          </span>
          <button
            onClick={() => router.push(`/editeur/${projectId}`)}
            className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Commander
          </button>
        </div>
      </div>

      {/* Main preview area */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8 relative">
        {/* Previous button */}
        <button
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
          disabled={currentPage === 0}
          className={`absolute left-6 w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 ${
            currentPage === 0
              ? "text-white/20 cursor-not-allowed"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Page */}
        <div className="w-full max-w-xl mx-auto">
          {page && (
            <div
              className="w-full aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden relative transition-all duration-500"
              style={{ backgroundColor: page.background_color || "#FFFFFF" }}
            >
              {cells.length > 0 ? (
                cells.map((cell: GridCell, i: number) => {
                  const element =
                    page.elements?.find(
                      (el) =>
                        Math.abs(el.position_x - cell.x) < 2 &&
                        Math.abs(el.position_y - cell.y) < 2
                    ) ?? page.elements?.[i];

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
                      {element && element.element_type === "image" ? (
                        <div className="w-full h-full relative">
                          <Image
                            src={element.content}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 600px"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <ImageIcon className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-400">Page vide</p>
                </div>
              )}

              {/* Page type overlay for cover */}
              {page.page_type === "cover" && page.elements?.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/10 to-accent/10">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-dark/30">{projectTitle}</h2>
                    <p className="text-dark/20 mt-2">Couverture</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Page label */}
          <div className="text-center mt-4">
            <span className="text-white/40 text-sm">
              {page?.page_type === "cover"
                ? "Couverture"
                : page?.page_type === "back_cover"
                ? "4ème de couverture"
                : `Page ${page?.page_number}`}
            </span>
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={() => setCurrentPage((p) => Math.min(p + 1, pages.length - 1))}
          disabled={currentPage === pages.length - 1}
          className={`absolute right-6 w-12 h-12 rounded-full flex items-center justify-center transition-all z-10 ${
            currentPage === pages.length - 1
              ? "text-white/20 cursor-not-allowed"
              : "text-white/60 hover:text-white hover:bg-white/10"
          }`}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Page dots */}
      <div className="flex items-center justify-center gap-2 pb-6">
        {pages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentPage
                ? "bg-white w-6"
                : "bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
