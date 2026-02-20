"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type {
  Project,
  ProjectPage,
  LayoutTemplate,
  UserPhoto,
  PageElement,
} from "@/lib/types/editor";
import EditorSidebar from "@/components/editor/EditorSidebar";
import PageCanvas from "@/components/editor/PageCanvas";
import EditorHeader from "@/components/editor/EditorHeader";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<ProjectPage[]>([]);
  const [layouts, setLayouts] = useState<LayoutTemplate[]>([]);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarTab, setSidebarTab] = useState<"photos" | "layouts" | "text" | "settings">("photos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Stable client — ne change JAMAIS entre les renders
  const supabase = useMemo(() => createClient(), []);

  // Load project data
  const loadProject = useCallback(async () => {
    if (!user) return;
    try {
      const [projectRes, pagesRes, layoutsRes, photosRes] = await Promise.all([
        supabase.from("projects").select("*").eq("id", projectId).single(),
        supabase
          .from("project_pages")
          .select("*, page_elements(*)")
          .eq("project_id", projectId)
          .order("page_number"),
        supabase.from("layout_templates").select("*").order("display_order"),
        supabase
          .from("user_photos")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

    if (projectRes.data) setProject(projectRes.data as Project);
    if (pagesRes.data) {
      let pagesData = pagesRes.data as (ProjectPage & { page_elements: PageElement[] })[];

      // ── Ensure the project always has: cover + 26 content pages + back_cover ──
      if (projectRes.data) {
        const hasCover = pagesData.some((p) => p.page_type === "cover");
        const hasBackCover = pagesData.some((p) => p.page_type === "back_cover");
        const backCoverRow = pagesData.find((p) => p.page_type === "back_cover");
        const contentPages = pagesData.filter((p) => p.page_type === "content");
        const missingContent = 26 - contentPages.length;

        if (!hasCover || missingContent > 0 || !hasBackCover) {
          const toInsert: Record<string, unknown>[] = [];

          // Add cover if missing
          if (!hasCover) {
            toInsert.push({ project_id: projectId, page_number: 0, page_type: "cover", layout_id: "cover-full", background_color: "#FFFFFF" });
          }

          if (missingContent > 0) {
            // Move back_cover out of the way FIRST to avoid unique conflict
            if (backCoverRow) {
              await supabase
                .from("project_pages")
                .update({ page_number: 999 })
                .eq("id", backCoverRow.id);
            }

            // Find which page_numbers 1-26 are already taken
            const usedNumbers = new Set(contentPages.map((p) => p.page_number));
            let added = 0;
            for (let n = 1; n <= 26 && added < missingContent; n++) {
              if (!usedNumbers.has(n)) {
                toInsert.push({
                  project_id: projectId,
                  page_number: n,
                  page_type: "content",
                  layout_id: "1-full",
                  background_color: "#FFFFFF",
                });
                added++;
              }
            }
          }

          // Insert missing pages
          if (toInsert.length > 0) {
            await supabase.from("project_pages").insert(toInsert);
          }

          // Ensure back_cover is at page_number 27
          if (backCoverRow) {
            await supabase
              .from("project_pages")
              .update({ page_number: 27 })
              .eq("id", backCoverRow.id);
          } else if (!hasBackCover) {
            await supabase.from("project_pages").insert({
              project_id: projectId,
              page_number: 27,
              page_type: "back_cover",
              layout_id: "cover-centered",
              background_color: "#FFFFFF",
            });
          }

          // Reload pages after changes
          const { data: reloaded } = await supabase
            .from("project_pages")
            .select("*, page_elements(*)")
            .eq("project_id", projectId)
            .order("page_number");
          if (reloaded) {
            pagesData = reloaded as (ProjectPage & { page_elements: PageElement[] })[];
          }
        }
      }

      const pagesWithElements = pagesData.map((p) => ({
        ...p,
        elements: p.page_elements ?? [],
      }));
      setPages(pagesWithElements);
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
    if (photosRes.data) {
      const photosWithUrls = (photosRes.data as UserPhoto[]).map((p) => ({
        ...p,
        publicUrl: supabase.storage
          .from("user-photos")
          .getPublicUrl(p.file_path).data.publicUrl,
      }));
      setPhotos(photosWithUrls);
    }
    } catch (err) {
      console.error("[loadProject] erreur:", err);
    } finally {
      setLoading(false);
    }
  }, [user, projectId, supabase]);

  // Redirect if not authenticated — load project once auth resolves
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/connexion");
    }
    if (!authLoading && user) {
      loadProject();
    }
  }, [user, authLoading, router, loadProject]);

  // Add a new spread (2 pages) before back cover
  const addPage = async () => {
    const backCoverPage = pages.find((p) => p.page_type === "back_cover");

    if (backCoverPage) {
      // Step 1: move back_cover to a high temp number to avoid UNIQUE conflict
      await supabase
        .from("project_pages")
        .update({ page_number: backCoverPage.page_number + 2 })
        .eq("id", backCoverPage.id);

      // Step 2: insert 2 new content pages (one spread)
      await supabase.from("project_pages").insert([
        {
          project_id: projectId,
          page_number: backCoverPage.page_number,
          page_type: "content",
          layout_id: "1-full",
          background_color: "#FFFFFF",
        },
        {
          project_id: projectId,
          page_number: backCoverPage.page_number + 1,
          page_type: "content",
          layout_id: "1-full",
          background_color: "#FFFFFF",
        },
      ]);
    } else {
      // No back cover — just append 2 content pages
      const maxNum = pages.length > 0 ? Math.max(...pages.map((p) => p.page_number)) : 0;
      await supabase.from("project_pages").insert([
        { project_id: projectId, page_number: maxNum + 1, page_type: "content", layout_id: "1-full", background_color: "#FFFFFF" },
        { project_id: projectId, page_number: maxNum + 2, page_type: "content", layout_id: "1-full", background_color: "#FFFFFF" },
      ]);
    }

    await loadProject();
  };

  // Delete a page
  const deletePage = async (pageId: string) => {
    const page = pages.find((p) => p.id === pageId);
    if (!page || page.page_type === "cover" || page.page_type === "back_cover") return;

    await supabase.from("project_pages").delete().eq("id", pageId);
    await loadProject();
    if (activePage >= pages.length - 1) setActivePage(Math.max(0, pages.length - 2));
  };

  // Change layout of current page
  const changeLayout = async (layoutId: string) => {
    const page = pages[activePage];
    if (!page) return;

    setSaving(true);
    await supabase
      .from("project_pages")
      .update({ layout_id: layoutId })
      .eq("id", page.id);

    await loadProject();
    setSaving(false);
  };

  // Upload photo
  const uploadPhoto = async (file: File) => {
    if (!user) return;

    const ext = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("user-photos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return;
    }

    // Get image dimensions
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    const dims = await new Promise<{ w: number; h: number }>((resolve) => {
      img.onload = () => resolve({ w: img.width, h: img.height });
      img.src = url;
    });
    URL.revokeObjectURL(url);

    await supabase.from("user_photos").insert({
      user_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      width: dims.w,
      height: dims.h,
    });

    await loadProject();
  };

  // Add element to page
  const addElementToPage = async (
    photo: UserPhoto,
    cellIndex: number
  ) => {
    const page = pages[activePage];
    if (!page) return;

    const layout = layouts.find((l) => l.id === page.layout_id);
    if (!layout) return;

    const cell = layout.grid_config[cellIndex];
    if (!cell) return;

    setSaving(true);
    await supabase.from("page_elements").insert({
      page_id: page.id,
      element_type: "image",
      content: photo.publicUrl || photo.file_path,
      position_x: cell.x,
      position_y: cell.y,
      width: cell.w,
      height: cell.h,
      rotation: 0,
      z_index: (page.elements?.length ?? 0) + 1,
    });

    await loadProject();
    setSaving(false);
  };

  // Remove element
  const removeElement = async (elementId: string) => {
    setSaving(true);
    await supabase.from("page_elements").delete().eq("id", elementId);
    await loadProject();
    setSaving(false);
  };

  // Update project title
  const updateTitle = async (title: string) => {
    if (!project) return;
    await supabase.from("projects").update({ title }).eq("id", project.id);
    setProject((prev) => (prev ? { ...prev, title } : null));
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-medium-gray">Chargement de l&apos;éditeur...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-dark mb-2">Projet introuvable</h2>
          <p className="text-medium-gray mb-6">Ce projet n&apos;existe pas ou vous n&apos;y avez pas accès.</p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-3 bg-primary text-white rounded-full font-semibold hover:bg-primary-dark transition-colors"
          >
            Retour à l&apos;accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      {/* Editor Header */}
      <EditorHeader
        project={project}
        saving={saving}
        onUpdateTitle={updateTitle}
        onPreview={() => router.push(`/editeur/${projectId}/preview`)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <EditorSidebar
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          activeTab={sidebarTab}
          onTabChange={setSidebarTab}
          photos={photos}
          layouts={layouts}
          currentLayoutId={pages[activePage]?.layout_id}
          onUploadPhoto={uploadPhoto}
          onSelectLayout={changeLayout}
          onDragPhoto={(photo) => {
            // Simple: add to first empty cell
            const page = pages[activePage];
            if (!page) return;
            const layout = layouts.find((l) => l.id === page.layout_id);
            if (!layout) return;
            const usedCells = page.elements?.length ?? 0;
            if (usedCells < layout.grid_config.length) {
              addElementToPage(photo, usedCells);
            }
          }}
        />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Canvas */}
          <div className="flex-1 overflow-y-auto p-8">
            <div className="flex flex-col items-center">
              <PageCanvas
                pages={pages}
                layouts={layouts}
                activePage={activePage}
                onSelectPage={setActivePage}
                onPageAction={(pageIndex, action) => {
                  setActivePage(pageIndex);
                  if (action === "photos") {
                    setSidebarTab("photos");
                    if (!sidebarOpen) setSidebarOpen(true);
                  } else if (action === "layout") {
                    setSidebarTab("layouts");
                    if (!sidebarOpen) setSidebarOpen(true);
                  }
                }}
                onRemoveElement={removeElement}
                onAddPage={addPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
