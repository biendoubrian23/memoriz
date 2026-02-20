"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  ImageIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type {
  ProjectPage,
  LayoutTemplate,
  PageElement,
  GridCell,
} from "@/lib/types/editor";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
type NormalizedView = {
  left: ProjectPage | null;
  right: ProjectPage | null;
  label: string;
};

type FlipState = {
  direction: "forward" | "backward";
  angle: number; // 0 → 180
  toView: number;
};

/* easing */
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/* ═══════════════════════════════════════════
   Main component
   ═══════════════════════════════════════════ */
export default function PreviewPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { user, loading: authLoading } = useAuth();

  /* data */
  const [pages, setPages] = useState<ProjectPage[]>([]);
  const [layouts, setLayouts] = useState<LayoutTemplate[]>([]);
  const [currentView, setCurrentView] = useState(0);
  const [loading, setLoading] = useState(true);
  const [projectTitle, setProjectTitle] = useState("");
  const [formatDims, setFormatDims] = useState({ w: 21, h: 29.7 });

  /* flip animation */
  const [flip, setFlip] = useState<FlipState | null>(null);
  const flipRef = useRef<FlipState | null>(null);
  const animFrameRef = useRef(0);

  /* drag */
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const bookRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false); // for cursor

  const supabase = useMemo(() => createClient(), []);

  // keep ref in sync
  useEffect(() => {
    flipRef.current = flip;
  }, [flip]);

  // cleanup
  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  /* ── Load data ── */
  const loadData = useCallback(async () => {
    if (!user) return;
    const [projectRes, pagesRes, layoutsRes] = await Promise.all([
      supabase
        .from("projects")
        .select("*, formats(width_cm, height_cm)")
        .eq("id", projectId)
        .single(),
      supabase
        .from("project_pages")
        .select("*, page_elements(*)")
        .eq("project_id", projectId)
        .order("page_number"),
      supabase.from("layout_templates").select("*").order("display_order"),
    ]);

    if (projectRes.data) {
      setProjectTitle(projectRes.data.title);
      const fmt = projectRes.data.formats as {
        width_cm: number;
        height_cm: number;
      } | null;
      if (fmt) setFormatDims({ w: fmt.width_cm, h: fmt.height_cm });
    }
    if (pagesRes.data) {
      setPages(
        (
          pagesRes.data as (ProjectPage & { page_elements: PageElement[] })[]
        ).map((p) => ({ ...p, elements: p.page_elements ?? [] }))
      );
    }
    if (layoutsRes.data) {
      setLayouts(
        (layoutsRes.data as LayoutTemplate[]).map((l) => ({
          ...l,
          grid_config:
            typeof l.grid_config === "string"
              ? JSON.parse(l.grid_config)
              : l.grid_config,
        }))
      );
    }
    setLoading(false);
  }, [user, projectId, supabase]);

  useEffect(() => {
    if (user) loadData();
  }, [user, loadData]);

  /* ────────────────────────────────────────────
     Build normalised views:
       cover   → { left: null,  right: coverPage     }
       spread  → { left: pageA, right: pageB | null   }
       back    → { left: backP, right: null            }
     ──────────────────────────────────────────── */
  const views: NormalizedView[] = useMemo(() => {
    if (pages.length === 0) return [];
    const result: NormalizedView[] = [];
    const cover = pages.find((p) => p.page_type === "cover");
    const backCover = pages.find((p) => p.page_type === "back_cover");
    const content = pages.filter(
      (p) => p.page_type !== "cover" && p.page_type !== "back_cover"
    );

    if (cover) result.push({ left: null, right: cover, label: "Couverture" });

    for (let i = 0; i < content.length; i += 2) {
      const left = content[i];
      const right = content[i + 1] ?? null;
      result.push({
        left,
        right,
        label: right
          ? `Pages ${left.page_number} – ${right.page_number}`
          : `Page ${left.page_number}`,
      });
    }

    if (backCover)
      result.push({
        left: backCover,
        right: null,
        label: "4ème de couverture",
      });

    return result;
  }, [pages]);

  /* ── Animate flip angle from → to ── */
  const animateFlipTo = useCallback(
    (from: number, to: number, onDone: () => void) => {
      cancelAnimationFrame(animFrameRef.current);
      const duration = 350 + Math.abs(to - from) * 1.4;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const angle = from + (to - from) * eased;

        setFlip((prev) => (prev ? { ...prev, angle } : null));

        if (progress < 1) {
          animFrameRef.current = requestAnimationFrame(tick);
        } else {
          onDone();
        }
      };
      animFrameRef.current = requestAnimationFrame(tick);
    },
    []
  );

  /* ── Navigate via buttons / keyboard ── */
  const goTo = useCallback(
    (dir: "next" | "prev") => {
      if (flipRef.current) return;
      const target = dir === "next" ? currentView + 1 : currentView - 1;
      if (target < 0 || target >= views.length) return;

      const direction: "forward" | "backward" =
        dir === "next" ? "forward" : "backward";
      const state: FlipState = { direction, angle: 0, toView: target };
      setFlip(state);
      flipRef.current = state;

      requestAnimationFrame(() => {
        animateFlipTo(0, 180, () => {
          setCurrentView(target);
          setFlip(null);
          flipRef.current = null;
        });
      });
    },
    [currentView, views.length, animateFlipTo]
  );

  /* ── Drag: mouse down on a page ── */
  const handlePageMouseDown = useCallback(
    (side: "left" | "right", e: React.MouseEvent) => {
      const canFwd =
        side === "right" &&
        currentView < views.length - 1 &&
        !flipRef.current;
      const canBwd = side === "left" && currentView > 0 && !flipRef.current;
      if (!canFwd && !canBwd) return;

      e.preventDefault();
      isDragging.current = true;
      dragStartX.current = e.clientX;
      setDragging(true);

      const direction: "forward" | "backward" = canFwd
        ? "forward"
        : "backward";
      const toView = canFwd ? currentView + 1 : currentView - 1;
      const state: FlipState = { direction, angle: 0, toView };
      setFlip(state);
      flipRef.current = state;
    },
    [currentView, views.length]
  );

  /* ── Drag: mouse move / up (global) ── */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !flipRef.current) return;
      const bookW = bookRef.current?.offsetWidth ?? 800;
      const half = bookW / 2;
      const dx = e.clientX - dragStartX.current;

      let angle: number;
      if (flipRef.current.direction === "forward") {
        angle = Math.max(0, Math.min(180, (-dx / half) * 180));
      } else {
        angle = Math.max(0, Math.min(180, (dx / half) * 180));
      }
      setFlip((prev) => (prev ? { ...prev, angle } : null));
    };

    const onUp = () => {
      if (!isDragging.current || !flipRef.current) return;
      isDragging.current = false;
      setDragging(false);
      const f = flipRef.current;

      if (f.angle > 90) {
        animateFlipTo(f.angle, 180, () => {
          setCurrentView(f.toView);
          setFlip(null);
          flipRef.current = null;
        });
      } else {
        animateFlipTo(f.angle, 0, () => {
          setFlip(null);
          flipRef.current = null;
        });
      }
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [animateFlipTo]);

  /* ── Keyboard ── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goTo("next");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goTo("prev");
      } else if (e.key === "Escape") {
        router.push(`/editeur/${projectId}`);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goTo, projectId, router]);

  /* ── Loading ── */
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* ── Derived values ── */
  const cv = views[currentView];
  const pageAspect = `${formatDims.w} / ${formatDims.h}`;
  const isLandscape = formatDims.w > formatDims.h;
  const pageH = isLandscape ? "55vh" : "70vh";

  const canGoNext = currentView < views.length - 1;
  const canGoPrev = currentView > 0;

  /* ── What to render on each half + flip faces ── */
  let baseLeft = cv?.left ?? null;
  let baseRight = cv?.right ?? null;
  let flipFront: ProjectPage | null = null;
  let flipBack: ProjectPage | null = null;

  if (flip) {
    const target = views[flip.toView];
    if (flip.direction === "forward") {
      baseLeft = cv?.left ?? null; // stays visible
      baseRight = target?.right ?? null; // revealed underneath
      flipFront = cv?.right ?? null; // current right (front)
      flipBack = target?.left ?? null; // next left (back)
    } else {
      baseLeft = target?.left ?? null; // revealed underneath
      baseRight = cv?.right ?? null; // stays visible
      flipFront = cv?.left ?? null; // current left (front)
      flipBack = target?.right ?? null; // prev right (back)
    }
  }

  // shadow intensity peaked at 90°
  const shadowI = flip
    ? Math.sin((flip.angle / 180) * Math.PI) * 0.35
    : 0;

  // is the cover currently showing (for overlay)?
  const isCoverView = currentView === 0 && views[0]?.right?.page_type === "cover";
  const isBackCoverView =
    currentView === views.length - 1 &&
    views[views.length - 1]?.left?.page_type === "back_cover";

  return (
    <div
      className="min-h-screen bg-gray-900 flex flex-col select-none"
      style={{ cursor: dragging ? "grabbing" : "default" }}
    >
      {/* ── Header ── */}
      <div className="h-14 flex items-center justify-between px-6 shrink-0 z-20">
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
            {currentView + 1} / {views.length}
          </span>
          <button className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-2">
            <ShoppingCart className="w-4 h-4" />
            Commander
          </button>
        </div>
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8 relative">
        {/* Prev button */}
        <button
          onClick={() => goTo("prev")}
          disabled={!canGoPrev || !!flip}
          aria-label="Page précédente"
          className={`absolute left-4 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            canGoPrev && !flip
              ? "text-white/60 hover:text-white hover:bg-white/10"
              : "text-white/20 cursor-not-allowed"
          }`}
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* ── BOOK ── */}
        <div style={{ perspective: "2200px" }}>
          <div
            ref={bookRef}
            className="relative flex items-stretch"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* ─── LEFT PAGE (base) ─── */}
            <div
              className="relative overflow-hidden rounded-l-2xl shadow-2xl"
              style={{
                aspectRatio: pageAspect,
                height: pageH,
                backgroundColor: baseLeft
                  ? baseLeft.background_color || "#FFFFFF"
                  : "#1f2937",
                cursor:
                  canGoPrev && !flip && !dragging ? "pointer" : "default",
              }}
              onMouseDown={(e) => handlePageMouseDown("left", e)}
            >
              {baseLeft ? (
                <PageContent page={baseLeft} layouts={layouts} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-700">
                  {/* endpaper texture lines */}
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, transparent, transparent 19px, #9ca3af 19px, #9ca3af 20px)",
                    }}
                  />
                </div>
              )}

              {/* back cover overlay */}
              {isBackCoverView &&
                !flip &&
                baseLeft?.elements?.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <p className="text-white/30 text-sm">
                      4ème de couverture
                    </p>
                  </div>
                )}

              {/* shadow cast on left base during backward flip */}
              {flip?.direction === "backward" && (
                <div
                  className="absolute inset-0 z-30 pointer-events-none rounded-l-2xl"
                  style={{ backgroundColor: `rgba(0,0,0,${shadowI})` }}
                />
              )}
            </div>

            {/* ─── SPINE ─── */}
            <div
              className="w-1 shrink-0 z-50"
              style={{
                background:
                  "linear-gradient(90deg, #6b728080 0%, #d1d5db 25%, #f9fafb 50%, #d1d5db 75%, #6b728080 100%)",
                boxShadow: "0 0 8px rgba(0,0,0,0.3)",
              }}
            />

            {/* ─── RIGHT PAGE (base) ─── */}
            <div
              className="relative overflow-hidden rounded-r-2xl shadow-2xl"
              style={{
                aspectRatio: pageAspect,
                height: pageH,
                backgroundColor: baseRight
                  ? baseRight.background_color || "#FFFFFF"
                  : "#1f2937",
                cursor:
                  canGoNext && !flip && !dragging ? "pointer" : "default",
              }}
              onMouseDown={(e) => handlePageMouseDown("right", e)}
            >
              {baseRight ? (
                <PageContent page={baseRight} layouts={layouts} />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-l from-gray-800 to-gray-700">
                  <div
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage:
                        "repeating-linear-gradient(90deg, transparent, transparent 19px, #9ca3af 19px, #9ca3af 20px)",
                    }}
                  />
                </div>
              )}

              {/* cover overlay */}
              {isCoverView &&
                !flip &&
                baseRight?.elements?.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 z-10">
                    <div className="text-center">
                      <h2 className="text-3xl font-bold text-dark/30">
                        {projectTitle}
                      </h2>
                      <p className="text-dark/20 mt-2">Couverture</p>
                    </div>
                  </div>
                )}

              {/* shadow cast on right base during forward flip */}
              {flip?.direction === "forward" && (
                <div
                  className="absolute inset-0 z-30 pointer-events-none rounded-r-2xl"
                  style={{ backgroundColor: `rgba(0,0,0,${shadowI})` }}
                />
              )}
            </div>

            {/* ═══════════════════════════════
               FLIPPING PAGE (absolute overlay)
               ═══════════════════════════════ */}
            {flip && (
              <div
                className="absolute top-0 z-40 pointer-events-none"
                style={{
                  /* position over the correct half */
                  ...(flip.direction === "forward"
                    ? {
                        right: 0,
                        width: "calc(50% - 2px)",
                        transformOrigin: "left center",
                        transform: `rotateY(${-flip.angle}deg)`,
                      }
                    : {
                        left: 0,
                        width: "calc(50% - 2px)",
                        transformOrigin: "right center",
                        transform: `rotateY(${flip.angle}deg)`,
                      }),
                  height: "100%",
                  transformStyle: "preserve-3d",
                }}
              >
                {/* ── Front face ── */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    borderRadius:
                      flip.direction === "forward"
                        ? "0 1rem 1rem 0"
                        : "1rem 0 0 1rem",
                    backgroundColor:
                      flipFront?.background_color || "#FFFFFF",
                  }}
                >
                  {flipFront && (
                    <PageContent page={flipFront} layouts={layouts} />
                  )}
                  {/* lighting gradient following the curl */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        flip.direction === "forward"
                          ? `linear-gradient(to right, rgba(0,0,0,${
                              0.02 + shadowI * 0.25
                            }) 0%, transparent 50%)`
                          : `linear-gradient(to left, rgba(0,0,0,${
                              0.02 + shadowI * 0.25
                            }) 0%, transparent 50%)`,
                    }}
                  />
                </div>

                {/* ── Back face ── */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    borderRadius:
                      flip.direction === "forward"
                        ? "1rem 0 0 1rem"
                        : "0 1rem 1rem 0",
                    backgroundColor:
                      flipBack?.background_color || "#FFFFFF",
                  }}
                >
                  {flipBack && (
                    <PageContent page={flipBack} layouts={layouts} />
                  )}
                  {/* lighting gradient — reversed side */}
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        flip.direction === "forward"
                          ? `linear-gradient(to left, rgba(0,0,0,${
                              0.02 + shadowI * 0.25
                            }) 0%, transparent 50%)`
                          : `linear-gradient(to right, rgba(0,0,0,${
                              0.02 + shadowI * 0.25
                            }) 0%, transparent 50%)`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* ── Drop shadow from flipping page ── */}
            {flip && (
              <div
                className="absolute top-0 z-[35] pointer-events-none"
                style={{
                  ...(flip.direction === "forward"
                    ? { left: 0, width: "calc(50% - 2px)" }
                    : { right: 0, width: "calc(50% - 2px)" }),
                  height: "100%",
                  borderRadius:
                    flip.direction === "forward"
                      ? "1rem 0 0 1rem"
                      : "0 1rem 1rem 0",
                  boxShadow:
                    flip.angle > 5
                      ? `${
                          flip.direction === "forward" ? "" : "-"
                        }${Math.round(shadowI * 30)}px 0 ${Math.round(
                          shadowI * 40
                        )}px rgba(0,0,0,${shadowI * 0.6})`
                      : "none",
                }}
              />
            )}
          </div>
        </div>

        {/* Next button */}
        <button
          onClick={() => goTo("next")}
          disabled={!canGoNext || !!flip}
          aria-label="Page suivante"
          className={`absolute right-4 z-30 w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            canGoNext && !flip
              ? "text-white/60 hover:text-white hover:bg-white/10"
              : "text-white/20 cursor-not-allowed"
          }`}
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* ── Footer: label + dots ── */}
      <div className="flex flex-col items-center gap-3 pb-6">
        <span className="text-white/40 text-sm">{cv?.label}</span>
        <div className="flex items-center justify-center gap-2">
          {views.map((_, i) => (
            <button
              key={i}
              aria-label={`Aller à la vue ${i + 1}`}
              onClick={() => {
                if (!flipRef.current && i !== currentView) {
                  setCurrentView(i);
                }
              }}
              className={`rounded-full transition-all ${
                i === currentView
                  ? "bg-white w-6 h-2"
                  : "bg-white/30 hover:bg-white/50 w-2 h-2"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Sub-component: render page layout cells + images
   ═══════════════════════════════════════════════════ */
function PageContent({
  page,
  layouts,
}: {
  page: ProjectPage;
  layouts: LayoutTemplate[];
}) {
  const layout = layouts.find((l) => l.id === page.layout_id) ?? null;
  const cells: GridCell[] = layout?.grid_config ?? [];
  const elements = page.elements ?? [];

  if (cells.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <ImageIcon className="w-10 h-10 text-gray-200" />
      </div>
    );
  }

  return (
    <>
      {cells.map((cell, i) => {
        const el =
          elements.find(
            (e) =>
              Math.abs(e.position_x - cell.x) < 2 &&
              Math.abs(e.position_y - cell.y) < 2
          ) ?? elements[i];

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
            {el?.element_type === "image" ? (
              <div className="w-full h-full relative">
                <Image
                  src={el.content}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 600px"
                />
              </div>
            ) : (
              <div className="w-full h-full bg-gray-100/50 flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-200" />
              </div>
            )}
          </div>
        );
      })}
    </>
  );
}
