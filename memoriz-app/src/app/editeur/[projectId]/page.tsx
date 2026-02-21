"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import type {
  Project,
  ProjectPage,
  LayoutTemplate,
  UserPhoto,
  PageElement,
  ProjectOptions,
  SelectedOptions,
  ProductOption,
} from "@/lib/types/editor";
import EditorSidebar from "@/components/editor/EditorSidebar";
import PageCanvas from "@/components/editor/PageCanvas";
import EditorHeader from "@/components/editor/EditorHeader";
import DesignerModal from "@/components/editor/DesignerModal";
import MagazineEditor from "@/components/editor/magazine/MagazineEditor";
import type { GridCell, FreeformElement, MagazineFreeformConfig } from "@/lib/types/editor";
import { isMagazineConfig, pageElementToFreeform, freeformToDbRecord } from "@/lib/types/editor";
import { getMagazineTemplate } from "@/lib/magazine-templates";
import TemplateEditorModal from "@/components/template-editor/TemplateEditorModal";

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = params.projectId as string;
  const { user, loading: authLoading } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [pages, setPages] = useState<ProjectPage[]>([]);
  const [layouts, setLayouts] = useState<LayoutTemplate[]>([]);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [activePage, setActivePage] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  type MainTab = "photos" | "layouts" | "text" | "templates" | "options" | "settings";
  const VALID_MAIN_TABS: MainTab[] = ["photos", "layouts", "text", "templates", "options", "settings"];
  const [sidebarTab, setSidebarTabRaw] = useState<MainTab>(() => {
    const urlTab = searchParams.get("tab") as MainTab | null;
    return urlTab && VALID_MAIN_TABS.includes(urlTab) ? urlTab : "photos";
  });

  // Wrapper that also persists the tab in the URL
  const setSidebarTab = useCallback((tab: MainTab) => {
    setSidebarTabRaw(tab);
    const url = new URL(window.location.href);
    url.searchParams.set("tab", tab);
    window.history.replaceState({}, "", url.toString());
  }, []);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Product options (all available choices)
  const [productOptions, setProductOptions] = useState<ProjectOptions | null>(null);
  // Currently selected option IDs
  const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
    binding_type_id: null,
    format_id: null,
    paper_type_id: null,
    lamination_type_id: null,
    printing_type_id: null,
  });
  // Format reset popup
  const [formatResetPopup, setFormatResetPopup] = useState<{ newFormatId: string } | null>(null);
  // Designer modal
  const [designerPageIndex, setDesignerPageIndex] = useState<number | null>(null);
  // Magazine editor modal
  const [magazinePageIndex, setMagazinePageIndex] = useState<number | null>(null);
  // Template editor modal (super_admin creates templates)
  // Persisted in URL so refresh keeps the modal open
  const [templateEditorTheme, setTemplateEditorTheme] = useState<string | null>(
    () => searchParams.get("templateEditor")
  );

  // Stable client — ne change JAMAIS entre les renders
  const supabase = useMemo(() => createClient(), []);

  // Load project data
  const loadProject = useCallback(async () => {
    if (!user) return;
    try {
      const [
        projectRes, pagesRes, layoutsRes, photosRes,
        bindingsRes, formatsRes, papersRes, laminationsRes, printingsRes,
      ] = await Promise.all([
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
        // Product options
        supabase.from("binding_types").select("*").order("display_order"),
        supabase.from("formats").select("*").order("display_order"),
        supabase.from("paper_types").select("*").order("display_order"),
        supabase.from("lamination_types").select("*").order("display_order"),
        supabase.from("printing_types").select("*").order("display_order"),
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
      const dbLayouts = (layoutsRes.data as LayoutTemplate[]).map((l) => ({
        ...l,
        grid_config:
          typeof l.grid_config === "string"
            ? JSON.parse(l.grid_config)
            : l.grid_config,
      }));
      // Only use DB layouts (dynamic templates removed — admin creates them)
      setLayouts(dbLayouts);
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

    // ── Product options ──
    const toOption = (row: Record<string, unknown>): ProductOption => ({
      id: row.id as string,
      name: row.name as string,
      slug: row.slug as string,
      description: (row.description as string) ?? null,
      image_url: (row.image_url as string) ?? null,
      display_order: (row.display_order as number) ?? 0,
      width_cm: row.width_cm as number | undefined,
      height_cm: row.height_cm as number | undefined,
      subtitle:
        row.width_cm && row.height_cm
          ? `${row.width_cm} × ${row.height_cm} cm`
          : undefined,
    });

    setProductOptions({
      bindings: (bindingsRes.data ?? []).map(toOption),
      formats: (formatsRes.data ?? []).map(toOption),
      papers: (papersRes.data ?? []).map(toOption),
      laminations: (laminationsRes.data ?? []).map(toOption),
      printings: (printingsRes.data ?? []).map(toOption),
    });

    if (projectRes.data) {
      const p = projectRes.data as Project;
      setSelectedOptions({
        binding_type_id: p.binding_type_id,
        format_id: p.format_id,
        paper_type_id: p.paper_type_id,
        lamination_type_id: p.lamination_type_id,
        printing_type_id: p.printing_type_id,
      });
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
    // Check if this is a magazine template
    const magTemplate = getMagazineTemplate(layoutId);
    if (magTemplate) {
      await applyMagazineTemplate(layoutId);
      return;
    }

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

  // Apply a magazine template → create freeform elements
  const applyMagazineTemplate = async (templateId: string) => {
    const page = pages[activePage];
    if (!page) return;

    const template = getMagazineTemplate(templateId);
    if (!template) return;

    setSaving(true);

    // Delete existing elements on this page
    if (page.elements?.length) {
      await supabase.from("page_elements").delete().eq("page_id", page.id);
    }

    // Update layout_id to the magazine template id
    await supabase
      .from("project_pages")
      .update({ layout_id: templateId, background_color: template.config.backgroundColor ?? "#ffffff" })
      .eq("id", page.id);

    // Create all elements from template
    const elementsToInsert = template.config.elements.map((el, i) => ({
      page_id: page.id,
      element_type: el.type,
      content: el.type === "text" ? (el.content ?? "") : (el.imageUrl ?? ""),
      position_x: el.x,
      position_y: el.y,
      width: el.width,
      height: el.height,
      rotation: el.rotation,
      z_index: el.zIndex,
      styles: {
        opacity: el.opacity,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight: el.fontWeight,
        fontStyle: el.fontStyle,
        letterSpacing: el.letterSpacing,
        lineHeight: el.lineHeight,
        textTransform: el.textTransform,
        textAlign: el.textAlign,
        textColor: el.textColor,
        textShadow: el.textShadow,
        objectFit: el.objectFit,
        objectPosition: el.objectPosition,
        borderRadius: el.borderRadius,
        clipPath: el.clipPath,
        shapeType: el.shapeType,
        fillColor: el.fillColor,
        strokeColor: el.strokeColor,
        strokeWidth: el.strokeWidth,
        borderStyle: el.borderStyle,
        locked: el.locked,
      },
    }));

    await supabase.from("page_elements").insert(elementsToInsert);
    await loadProject();
    setSaving(false);

    // Auto-open magazine editor
    setMagazinePageIndex(activePage);
  };

  // Save magazine editor changes
  const saveMagazineElements = async (elements: FreeformElement[]) => {
    const pageIdx = magazinePageIndex;
    if (pageIdx === null) return;
    const page = pages[pageIdx];
    if (!page) return;

    // Delete all existing elements
    await supabase.from("page_elements").delete().eq("page_id", page.id);

    // Insert updated elements
    if (elements.length > 0) {
      const records = elements.map((el) => freeformToDbRecord(el, page.id));
      await supabase.from("page_elements").insert(records);
    }

    await loadProject();
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
    // Magazine freeform layouts don't support cell-based insertion
    if (isMagazineConfig(layout.grid_config)) return;

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

  // ── Handle option change ──
  const handleChangeOption = useCallback(
    async (key: keyof SelectedOptions, id: string) => {
      if (!project) return;

      // FORMAT change → show confirmation popup instead of applying immediately
      if (key === "format_id" && id !== selectedOptions.format_id) {
        setFormatResetPopup({ newFormatId: id });
        return;
      }

      // Non-format options → update immediately
      setSaving(true);
      const { error } = await supabase
        .from("projects")
        .update({ [key]: id })
        .eq("id", project.id);

      if (!error) {
        setSelectedOptions((prev) => ({ ...prev, [key]: id }));
        setProject((prev) => (prev ? { ...prev, [key]: id } : null));
      }
      setSaving(false);
    },
    [project, selectedOptions.format_id, supabase]
  );

  // Confirm format change → delete all pages then recreate defaults
  const confirmFormatChange = useCallback(async () => {
    if (!formatResetPopup || !project) return;
    const newFormatId = formatResetPopup.newFormatId;
    setFormatResetPopup(null);

    setSaving(true);
    // 1. Delete all project pages (cascade deletes page_elements via FK)
    await supabase.from("project_pages").delete().eq("project_id", project.id);

    // 2. Update project format
    await supabase
      .from("projects")
      .update({ format_id: newFormatId })
      .eq("id", project.id);

    setSelectedOptions((prev) => ({ ...prev, format_id: newFormatId }));
    setProject((prev) => (prev ? { ...prev, format_id: newFormatId } : null));

    // 3. Reload project → loadProject will auto-create the default pages
    await loadProject();
    setActivePage(0);
    setSaving(false);
  }, [formatResetPopup, project, supabase, loadProject]);

  // Derive format dimensions for canvas rendering
  const selectedFormat = productOptions?.formats.find(f => f.id === selectedOptions.format_id);
  const formatDimensions = selectedFormat
    ? { width_cm: selectedFormat.width_cm ?? 21, height_cm: selectedFormat.height_cm ?? 29.7 }
    : { width_cm: 21, height_cm: 29.7 };

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
          productOptions={productOptions ?? undefined}
          selectedOptions={selectedOptions}
          onChangeOption={handleChangeOption}
          onCreateTemplate={(themeId) => {
            setTemplateEditorTheme(themeId);
            // Persist in URL so refresh keeps the modal open
            const url = new URL(window.location.href);
            url.searchParams.set("templateEditor", themeId);
            window.history.replaceState({}, "", url.toString());
          }}
          onDragPhoto={(photo) => {
            // Find first empty IMAGE cell (skip text cells)
            const page = pages[activePage];
            if (!page) return;
            const layout = layouts.find((l) => l.id === page.layout_id);
            if (!layout) return;
            // Magazine freeform layouts don't use grid cells
            if (isMagazineConfig(layout.grid_config)) return;
            const emptyCellIdx = layout.grid_config.findIndex((cell, idx) => {
              if (cell.type === "text") return false;
              const hasElement = page.elements?.some(
                (el) =>
                  el.element_type === "image" &&
                  Math.abs(el.position_x - cell.x) < 2 &&
                  Math.abs(el.position_y - cell.y) < 2
              );
              return !hasElement;
            });
            if (emptyCellIdx >= 0) {
              addElementToPage(photo, emptyCellIdx);
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
                formatDimensions={formatDimensions}
                onSelectPage={setActivePage}
                onPageAction={(pageIndex, action) => {
                  setActivePage(pageIndex);
                  if (action === "photos") {
                    setSidebarTab("photos");
                    if (!sidebarOpen) setSidebarOpen(true);
                  } else if (action === "layout") {
                    setSidebarTab("layouts");
                    if (!sidebarOpen) setSidebarOpen(true);
                  } else if (action === "designer") {
                    // Check if page uses a magazine template → open MagazineEditor
                    const pg = pages[pageIndex];
                    if (pg?.layout_id && getMagazineTemplate(pg.layout_id)) {
                      setMagazinePageIndex(pageIndex);
                    } else {
                      setDesignerPageIndex(pageIndex);
                    }
                  }
                }}
                onRemoveElement={removeElement}
                onDropPhoto={async (pageIndex, cellIndex, photoUrl) => {
                  const page = pages[pageIndex];
                  if (!page) return;
                  const layout = layouts.find((l) => l.id === page.layout_id);
                  if (!layout) return;
                  // Magazine freeform layouts don't support grid drops
                  if (isMagazineConfig(layout.grid_config)) return;
                  const cell = layout.grid_config[cellIndex];
                  if (!cell || cell.type === "text") return;

                  // Check if element already exists at this position
                  const existing = page.elements?.find(
                    (el) =>
                      Math.abs(el.position_x - cell.x) < 2 &&
                      Math.abs(el.position_y - cell.y) < 2
                  );

                  setSaving(true);
                  if (existing) {
                    await supabase
                      .from("page_elements")
                      .update({ content: photoUrl, element_type: "image" })
                      .eq("id", existing.id);
                  } else {
                    await supabase.from("page_elements").insert({
                      page_id: page.id,
                      element_type: "image",
                      content: photoUrl,
                      position_x: cell.x,
                      position_y: cell.y,
                      width: cell.w,
                      height: cell.h,
                      rotation: 0,
                      z_index: (page.elements?.length ?? 0) + 1,
                    });
                  }
                  await loadProject();
                  setSaving(false);
                }}
                onAddPage={addPage}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Designer Modal */}
      {designerPageIndex !== null && pages[designerPageIndex] && (
        <DesignerModal
          page={pages[designerPageIndex]}
          layouts={layouts}
          photos={photos}
          formatDimensions={formatDimensions}
          onClose={() => setDesignerPageIndex(null)}
          onUpdateElement={async (
            pageId: string,
            cellIndex: number,
            cell: GridCell,
            content: string,
            type: "image" | "text"
          ) => {
            setSaving(true);
            // Check if element already exists at this position
            const page = pages[designerPageIndex];
            const existing = page?.elements?.find(
              (el) =>
                Math.abs(el.position_x - cell.x) < 2 &&
                Math.abs(el.position_y - cell.y) < 2
            );
            if (existing) {
              await supabase
                .from("page_elements")
                .update({ content, element_type: type })
                .eq("id", existing.id);
            } else {
              await supabase.from("page_elements").insert({
                page_id: pageId,
                element_type: type,
                content,
                position_x: cell.x,
                position_y: cell.y,
                width: cell.w,
                height: cell.h,
                rotation: 0,
                z_index: (page?.elements?.length ?? 0) + 1,
              });
            }
            await loadProject();
            setSaving(false);
          }}
          onSelectLayout={async (layoutId: string) => {
            const page = pages[designerPageIndex];
            if (!page) return;
            setSaving(true);
            await supabase
              .from("project_pages")
              .update({ layout_id: layoutId })
              .eq("id", page.id);
            await loadProject();
            setSaving(false);
          }}
        />
      )}

      {/* Magazine Editor Modal */}
      {magazinePageIndex !== null && pages[magazinePageIndex] && (() => {
        const magPage = pages[magazinePageIndex];
        const magTemplate = magPage.layout_id ? getMagazineTemplate(magPage.layout_id) : null;
        const bgColor = (magPage as ProjectPage & { background_color?: string }).background_color
          ?? magTemplate?.config.backgroundColor
          ?? "#ffffff";
        const bgGradient = magTemplate?.config.backgroundGradient;
        const freeformElements: FreeformElement[] = (magPage.elements ?? []).map(pageElementToFreeform);
        return (
          <MagazineEditor
            elements={freeformElements}
            photos={photos}
            backgroundColor={bgColor}
            backgroundGradient={bgGradient}
            canvasAspect={formatDimensions ? formatDimensions.width_cm / formatDimensions.height_cm : 210 / 297}
            onSave={async (elements) => {
              await saveMagazineElements(elements);
            }}
            onClose={() => setMagazinePageIndex(null)}
          />
        );
      })()}

      {/* Format Reset Confirmation Modal */}
      {formatResetPopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-lg font-bold">
                ⚠
              </div>
              <h3 className="text-lg font-bold text-dark">Changer le format ?</h3>
            </div>
            <p className="text-medium-gray text-sm mb-6 leading-relaxed">
              Changer le format de votre album va <strong className="text-dark">réinitialiser toutes les pages</strong> et supprimer les photos placées sur les pages. Vos photos ajoutées dans l&apos;éditeur seront conservées. Cette action est irréversible.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setFormatResetPopup(null)}
                className="px-5 py-2.5 rounded-full text-sm font-medium text-medium-gray hover:bg-gray-100 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmFormatChange}
                className="px-5 py-2.5 rounded-full text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                Confirmer le changement
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Template Editor Modal (super_admin) */}
      {templateEditorTheme && (
        <TemplateEditorModal
          themeId={templateEditorTheme}
          onClose={() => {
            setTemplateEditorTheme(null);
            // Remove URL param without triggering navigation
            const url = new URL(window.location.href);
            url.searchParams.delete("templateEditor");
            window.history.replaceState({}, "", url.toString());
          }}
          onTemplateSaved={() => {
            // Refresh layouts list to show the new template
            loadProject();
          }}
        />
      )}
    </div>
  );
}
