"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ImageIcon,
  LayoutGrid,
  Type,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Upload,
  X,
  Loader2,
  LogOut,
  FolderOpen,
  SlidersHorizontal,
  Palette,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import type { LayoutTemplate, UserPhoto, GridCell, ProjectOptions, SelectedOptions } from "@/lib/types/editor";

type SidebarTab = "photos" | "layouts" | "text" | "templates" | "options" | "settings";

type Props = {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  photos: UserPhoto[];
  layouts: LayoutTemplate[];
  currentLayoutId: string | null | undefined;
  onUploadPhoto: (file: File) => Promise<void>;
  onSelectLayout: (layoutId: string) => void;
  onDragPhoto: (photo: UserPhoto) => void;
  productOptions?: ProjectOptions;
  selectedOptions?: SelectedOptions;
  onChangeOption?: (key: keyof SelectedOptions, id: string) => void;
};

const tabs: { key: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { key: "photos", label: "Photos", icon: <ImageIcon className="w-5 h-5" /> },
  { key: "layouts", label: "Mises en page", icon: <LayoutGrid className="w-5 h-5" /> },
  { key: "text", label: "Texte", icon: <Type className="w-5 h-5" /> },
  { key: "templates", label: "Templates", icon: <Palette className="w-5 h-5" /> },
  { key: "options", label: "Options", icon: <SlidersHorizontal className="w-5 h-5" /> },
  { key: "settings", label: "Paramètres", icon: <Settings className="w-5 h-5" /> },
];

export default function EditorSidebar({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  photos,
  layouts,
  currentLayoutId,
  onUploadPhoto,
  onSelectLayout,
  onDragPhoto,
  productOptions,
  selectedOptions,
  onChangeOption,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Resizable panel
  const [panelWidth, setPanelWidth] = useState(288); // default w-72
  const isResizing = useRef(false);
  const MIN_PANEL = 220;
  const MAX_PANEL = 500;

  const onResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isResizing.current) return;
      // Panel starts after the 64px icon tab bar
      const newW = e.clientX - 64;
      setPanelWidth(Math.max(MIN_PANEL, Math.min(MAX_PANEL, newW)));
    };
    const onMouseUp = () => {
      isResizing.current = false;
    };
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      if (file.type.startsWith("image/")) {
        await onUploadPhoto(file);
      }
    }
    setUploading(false);
  };

  const contentLayouts = layouts.filter((l) => l.category === "standard" || l.category === "mixed");
  const coverLayouts = layouts.filter((l) => l.category === "cover");

  return (
    <div className="flex shrink-0 h-full">
      {/* Tab bar (always visible) */}
      <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              onTabChange(tab.key);
              if (!isOpen) onToggle();
            }}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs ${
              activeTab === tab.key && isOpen
                ? "bg-primary/10 text-primary"
                : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
            }`}
            title={tab.label}
          >
            {tab.icon}
            <span className="text-[10px] leading-none">{tab.label}</span>
          </button>
        ))}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Mes projets link */}
        <Link
          href="/mes-projets"
          className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all text-xs text-gray-400 hover:text-primary hover:bg-primary/5"
          title="Mes projets"
        >
          <FolderOpen className="w-5 h-5" />
          <span className="text-[10px] leading-none">Projets</span>
        </Link>

        {/* User avatar + logout at bottom */}
        <UserBottomSection />
      </div>

      {/* Panel */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden ${
          isOpen ? "" : "w-0"
        }`}
        style={isOpen ? { width: panelWidth } : undefined}
      >
        <div className="h-full flex flex-col" style={{ width: panelWidth }}>
          {/* Panel header */}
          <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
            <h3 className="text-sm font-semibold text-dark">
              {tabs.find((t) => t.key === activeTab)?.label}
            </h3>
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-dark hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Photos tab */}
            {activeTab === "photos" && (
              <div>
                {/* Upload area */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    handleFiles(e.dataTransfer.files);
                  }}
                  className={`border-2 border-dashed rounded-xl p-6 text-center mb-4 transition-colors cursor-pointer ${
                    dragOver
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFiles(e.target.files)}
                  />
                  {uploading ? (
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-2" />
                  ) : (
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  )}
                  <p className="text-sm text-medium-gray">
                    {uploading
                      ? "Upload en cours..."
                      : "Glissez vos photos ici ou cliquez"}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP — max 10 Mo</p>
                </div>

                {/* Photo grid */}
                {photos.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">
                    Aucune photo uploadée
                  </p>
                ) : (
                  <div className={`grid gap-2 ${panelWidth >= 320 ? "grid-cols-3" : "grid-cols-2"}`}>
                    {photos.map((photo) => (
                      <div
                        key={photo.id}
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData(
                            "application/memoriz-photo",
                            JSON.stringify({
                              id: photo.id,
                              publicUrl: photo.publicUrl ?? "",
                              file_path: photo.file_path,
                              file_name: photo.file_name,
                            })
                          );
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        onClick={() => onDragPhoto(photo)}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-primary transition-colors cursor-grab active:cursor-grabbing"
                      >
                        <Image
                          src={photo.publicUrl ?? ""}
                          alt={photo.file_name}
                          fill
                          className="object-cover pointer-events-none"
                          sizes="140px"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Glisser ou cliquer
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Layouts tab */}
            {activeTab === "layouts" && (
              <div>
                <p className="text-xs text-medium-gray mb-3 uppercase font-semibold tracking-wider">
                  Mises en page intérieures
                </p>
                <div className="grid grid-cols-2 gap-2 mb-6">
                  {contentLayouts.map((layout) => (
                    <SidebarTemplateCard
                      key={layout.id}
                      layout={layout}
                      isSelected={currentLayoutId === layout.id}
                      onClick={() => onSelectLayout(layout.id)}
                    />
                  ))}
                </div>

                <p className="text-xs text-medium-gray mb-3 uppercase font-semibold tracking-wider">
                  Couvertures
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {coverLayouts.map((layout) => (
                    <SidebarTemplateCard
                      key={layout.id}
                      layout={layout}
                      isSelected={currentLayoutId === layout.id}
                      onClick={() => onSelectLayout(layout.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Text tab */}
            {activeTab === "text" && (
              <div className="space-y-4">
                <p className="text-sm text-medium-gray">
                  Ajoutez du texte à vos pages pour raconter votre histoire.
                </p>
                <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-medium-gray hover:border-primary hover:text-primary transition-colors">
                  + Ajouter un titre
                </button>
                <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-medium-gray hover:border-primary hover:text-primary transition-colors">
                  + Ajouter un sous-titre
                </button>
                <button className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-sm text-medium-gray hover:border-primary hover:text-primary transition-colors">
                  + Ajouter un paragraphe
                </button>
              </div>
            )}

            {/* Templates tab */}
            {activeTab === "templates" && (
              <TemplatesAccordion
                layouts={layouts}
                currentLayoutId={currentLayoutId}
                onSelectLayout={onSelectLayout}
              />
            )}

            {/* Options tab */}
            {activeTab === "options" && productOptions && selectedOptions && (
              <div className="space-y-5">
                {/* Reliure */}
                <OptionSection
                  title="Type de reliure"
                  options={productOptions.bindings}
                  selectedId={selectedOptions.binding_type_id}
                  onSelect={(id) => onChangeOption?.("binding_type_id", id)}
                />

                {/* Format */}
                <OptionSection
                  title="Format"
                  options={productOptions.formats}
                  selectedId={selectedOptions.format_id}
                  onSelect={(id) => onChangeOption?.("format_id", id)}
                  showDimensions
                />

                {/* Papier */}
                <OptionSection
                  title="Papier intérieur"
                  options={productOptions.papers}
                  selectedId={selectedOptions.paper_type_id}
                  onSelect={(id) => onChangeOption?.("paper_type_id", id)}
                />

                {/* Pelliculage */}
                <OptionSection
                  title="Pelliculage couverture"
                  options={productOptions.laminations}
                  selectedId={selectedOptions.lamination_type_id}
                  onSelect={(id) => onChangeOption?.("lamination_type_id", id)}
                />

                {/* Impression */}
                <OptionSection
                  title="Impression intérieur"
                  options={productOptions.printings}
                  selectedId={selectedOptions.printing_type_id}
                  onSelect={(id) => onChangeOption?.("printing_type_id", id)}
                />
              </div>
            )}

            {/* Settings tab */}
            {activeTab === "settings" && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs text-medium-gray mb-2 uppercase font-semibold tracking-wider">
                    Couleur de fond
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      "#FFFFFF",
                      "#F8F9FA",
                      "#FFF8F0",
                      "#F0F4FF",
                      "#FFF0F0",
                      "#F0FFF4",
                      "#2d3436",
                      "#000000",
                    ].map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-lg border-2 border-gray-200 hover:border-primary transition-colors"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-medium-gray mb-2 uppercase font-semibold tracking-wider">
                    Informations du projet
                  </p>
                  <div className="text-sm text-medium-gray space-y-1">
                    <p>Pages : {/* pages count */}</p>
                    <p>Format : Album</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resize handle (when open) */}
      {isOpen && (
        <div
          onMouseDown={onResizeStart}
          className="w-1.5 cursor-col-resize shrink-0 hover:bg-primary/30 active:bg-primary/50 transition-colors group flex items-center justify-center"
          title="Redimensionner"
        >
          <div className="w-0.5 h-8 rounded-full bg-gray-300 group-hover:bg-primary/60 transition-colors" />
        </div>
      )}

      {/* Collapse button (when closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="absolute left-16 top-1/2 -translate-y-1/2 w-6 h-12 bg-white border border-gray-200 rounded-r-lg flex items-center justify-center text-gray-400 hover:text-dark hover:bg-gray-50 transition-colors z-10 shadow-sm"
        >
          <ChevronRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

/* ── User info + logout at bottom of icon bar ── */
function UserBottomSection() {
  const { user, profile, signOut } = useAuth();
  const [showPopup, setShowPopup] = useState(false);

  if (!user) return null;

  const initials = profile?.first_name && profile?.last_name
    ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase()
    : user.email?.[0]?.toUpperCase() ?? "U";

  const displayName = profile?.first_name && profile?.last_name
    ? `${profile.first_name} ${profile.last_name}`
    : user.email ?? "";

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold hover:bg-primary-dark transition-colors mb-2"
        title={displayName}
      >
        {initials}
      </button>

      {showPopup && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowPopup(false)} />
          <div className="absolute left-14 bottom-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 py-3 animate-fade-in">
            {/* User info */}
            <div className="px-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark truncate">{displayName}</p>
                  <p className="text-xs text-medium-gray truncate">{user.email}</p>
                </div>
              </div>
            </div>
            {/* Logout */}
            <div className="pt-1">
              <button
                onClick={async () => {
                  setShowPopup(false);
                  await signOut();
                }}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
              >
                <LogOut size={16} />
                Se déconnecter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ── OptionSection — compact visual selector for product options ── */
import type { ProductOption } from "@/lib/types/editor";

function OptionSection({
  title,
  options,
  selectedId,
  onSelect,
  showDimensions,
}: {
  title: string;
  options: ProductOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  showDimensions?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-medium-gray mb-2 uppercase font-semibold tracking-wider">
        {title}
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        {options.map((opt) => {
          const isSelected = opt.id === selectedId;
          return (
            <button
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              className={`relative rounded-lg border-2 p-1 transition-all text-center ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-gray-100 hover:border-gray-300"
              }`}
              title={opt.description ?? opt.name}
            >
              {opt.image_url ? (
                <div className="w-full aspect-square rounded overflow-hidden mb-1 bg-gray-50">
                  <Image
                    src={opt.image_url}
                    alt={opt.name}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className={`w-full aspect-square rounded mb-1 ${
                  opt.slug === "couleur"
                    ? "bg-gradient-to-br from-yellow-300 via-pink-400 to-blue-500"
                    : opt.slug === "noir-blanc"
                      ? "bg-gradient-to-br from-gray-900 via-gray-500 to-gray-100"
                      : "bg-gray-100"
                }`} />
              )}
              <p className="text-[10px] font-medium text-dark leading-tight truncate">
                {opt.name}
              </p>
              {showDimensions && opt.subtitle && (
                <p className="text-[9px] text-gray-400 leading-tight">{opt.subtitle}</p>
              )}
              {!showDimensions && opt.subtitle && (
                <p className="text-[9px] text-gray-400 leading-tight">{opt.subtitle}</p>
              )}
              {isSelected && (
                <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-primary rounded-full flex items-center justify-center">
                  <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═════════════════════════════════════════════
   SidebarTemplateCard — with hover preview
   ═════════════════════════════════════════════ */
function SidebarTemplateCard({
  layout,
  isSelected,
  onClick,
}: {
  layout: LayoutTemplate;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const cardRef = useRef<HTMLButtonElement>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  const isMagazine = layout.category === "magazine";

  useEffect(() => {
    if (hovered && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      // Show tooltip to the right of the sidebar
      setTooltipPos({
        top: rect.top + rect.height / 2,
        left: rect.right + 12,
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
        className={`relative aspect-[4/3] rounded-lg border-2 p-2 transition-all hover:shadow-md ${
          isSelected
            ? "border-primary bg-primary/5"
            : "border-gray-100 hover:border-gray-200"
        }`}
      >
        {/* Mini preview */}
        <div className="w-full h-full relative bg-white rounded overflow-hidden">
          {layout.grid_config.map((cell: GridCell, i: number) => (
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
                backgroundColor: cell.type === "text" ? "transparent" : undefined,
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
          {isMagazine && (
            <div className="absolute bottom-0.5 right-0.5 bg-accent/90 text-white text-[6px] font-bold px-1 py-0.5 rounded">
              MAG
            </div>
          )}
        </div>
        <span className="absolute bottom-1 left-1 right-1 text-[9px] text-center text-gray-500 truncate">
          {layout.name}
        </span>
        {isSelected && (
          <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>

      {/* ── Hover preview tooltip (large, to the right) ── */}
      {hovered && (
        <div
          className="fixed z-[100] pointer-events-none animate-fade-in"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
            transform: "translateY(-50%)",
          }}
        >
          <div className="w-56 bg-white rounded-xl shadow-2xl border border-gray-200 p-3">
            <div className="w-full aspect-[3/4] relative bg-gray-50 rounded-lg overflow-hidden mb-2">
              {layout.grid_config.map((cell: GridCell, i: number) => (
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
              {layout.photo_count} photo{layout.photo_count > 1 ? "s" : ""}
              {layout.grid_config.some((c) => c.type === "text") && " + texte"}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

/* ═════════════════════════════════════════════
   Template theme categories
   ═════════════════════════════════════════════ */
const TEMPLATE_THEMES: {
  key: string;
  label: string;
  emoji: string;
  description: string;
  color: string;          // accent ring/bg color
  filterCategory: string; // matches layout_templates.category
}[] = [
  {
    key: "magazine",
    label: "Magazine",
    emoji: "📰",
    description: "Layouts éditoriaux professionnels",
    color: "#E74C3C",
    filterCategory: "magazine",
  },
  {
    key: "famille",
    label: "Album Famille",
    emoji: "👨‍👩‍👧‍👦",
    description: "Souvenirs de famille chaleureux",
    color: "#E91E63",
    filterCategory: "famille",
  },
  {
    key: "road-trip",
    label: "Road Trip",
    emoji: "🗺️",
    description: "Carnets de voyage & aventures",
    color: "#2196F3",
    filterCategory: "road-trip",
  },
  {
    key: "mariage",
    label: "Mariage",
    emoji: "💍",
    description: "Votre plus beau jour",
    color: "#9C27B0",
    filterCategory: "mariage",
  },
  {
    key: "bebe",
    label: "Bébé · Naissance",
    emoji: "👶",
    description: "Les premiers moments précieux",
    color: "#FF9800",
    filterCategory: "bebe",
  },
];

/* ═════════════════════════════════════════════
   TemplatesAccordion — Accordion by theme
   ═════════════════════════════════════════════ */
function TemplatesAccordion({
  layouts,
  currentLayoutId,
  onSelectLayout,
}: {
  layouts: LayoutTemplate[];
  currentLayoutId: string | null | undefined;
  onSelectLayout: (layoutId: string) => void;
}) {
  const [openSection, setOpenSection] = useState<string | null>("magazine");

  const toggle = (key: string) => {
    setOpenSection((prev) => (prev === key ? null : key));
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-medium-gray mb-3 uppercase font-semibold tracking-wider">
        Thèmes de templates
      </p>

      {TEMPLATE_THEMES.map((theme) => {
        const themeLayouts = layouts.filter(
          (l) => l.category === theme.filterCategory
        );
        const isOpen = openSection === theme.key;
        const count = themeLayouts.length;

        return (
          <div
            key={theme.key}
            className="rounded-xl border border-gray-100 overflow-hidden transition-all"
          >
            {/* Accordion header */}
            <button
              onClick={() => toggle(theme.key)}
              className={`w-full flex items-center gap-3 px-3 py-3 text-left transition-colors ${
                isOpen
                  ? "bg-gray-50"
                  : "hover:bg-gray-50"
              }`}
            >
              <span className="text-lg leading-none">{theme.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-dark truncate">
                    {theme.label}
                  </span>
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: `${theme.color}15`,
                      color: theme.color,
                    }}
                  >
                    {count}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 truncate leading-tight mt-0.5">
                  {theme.description}
                </p>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Accordion content */}
            <div
              className={`transition-all duration-200 overflow-hidden ${
                isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div className="px-3 pb-3 pt-1">
                {count === 0 ? (
                  <div className="text-center py-6">
                    <span className="text-2xl block mb-2">{theme.emoji}</span>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Bientôt disponible !<br />
                      <span className="text-[10px]">
                        De nouveaux templates arrivent prochainement.
                      </span>
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {themeLayouts.map((layout) => (
                      <SidebarTemplateCard
                        key={layout.id}
                        layout={layout}
                        isSelected={currentLayoutId === layout.id}
                        onClick={() => onSelectLayout(layout.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
