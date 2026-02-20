"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  ImageIcon,
  LayoutGrid,
  Type,
  Settings,
  ChevronLeft,
  ChevronRight,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import type { LayoutTemplate, UserPhoto, GridCell } from "@/lib/types/editor";

type SidebarTab = "photos" | "layouts" | "text" | "settings";

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
};

const tabs: { key: SidebarTab; label: string; icon: React.ReactNode }[] = [
  { key: "photos", label: "Photos", icon: <ImageIcon className="w-5 h-5" /> },
  { key: "layouts", label: "Mises en page", icon: <LayoutGrid className="w-5 h-5" /> },
  { key: "text", label: "Texte", icon: <Type className="w-5 h-5" /> },
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
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
      </div>

      {/* Panel */}
      <div
        className={`bg-white border-r border-gray-200 transition-all duration-300 overflow-hidden ${
          isOpen ? "w-72" : "w-0"
        }`}
      >
        <div className="w-72 h-full flex flex-col">
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
                  <div className="grid grid-cols-2 gap-2">
                    {photos.map((photo) => (
                      <button
                        key={photo.id}
                        onClick={() => onDragPhoto(photo)}
                        className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100 hover:border-primary transition-colors"
                      >
                        <Image
                          src={photo.publicUrl ?? ""}
                          alt={photo.file_name}
                          fill
                          className="object-cover"
                          sizes="140px"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            Ajouter
                          </span>
                        </div>
                      </button>
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
                    <button
                      key={layout.id}
                      onClick={() => onSelectLayout(layout.id)}
                      className={`relative aspect-[4/3] rounded-lg border-2 p-2 transition-all hover:shadow-md ${
                        currentLayoutId === layout.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      {/* Mini preview */}
                      <div className="w-full h-full relative bg-white rounded">
                        {layout.grid_config.map((cell: GridCell, i: number) => (
                          <div
                            key={i}
                            className="absolute bg-gray-200 rounded-sm"
                            style={{
                              left: `${cell.x}%`,
                              top: `${cell.y}%`,
                              width: `${cell.w}%`,
                              height: `${cell.h}%`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] text-center text-gray-500 truncate">
                        {layout.name}
                      </span>
                    </button>
                  ))}
                </div>

                <p className="text-xs text-medium-gray mb-3 uppercase font-semibold tracking-wider">
                  Couvertures
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {coverLayouts.map((layout) => (
                    <button
                      key={layout.id}
                      onClick={() => onSelectLayout(layout.id)}
                      className={`relative aspect-[4/3] rounded-lg border-2 p-2 transition-all hover:shadow-md ${
                        currentLayoutId === layout.id
                          ? "border-primary bg-primary/5"
                          : "border-gray-100 hover:border-gray-200"
                      }`}
                    >
                      <div className="w-full h-full relative bg-white rounded">
                        {layout.grid_config.map((cell: GridCell, i: number) => (
                          <div
                            key={i}
                            className="absolute bg-gray-200 rounded-sm"
                            style={{
                              left: `${cell.x}%`,
                              top: `${cell.y}%`,
                              width: `${cell.w}%`,
                              height: `${cell.h}%`,
                            }}
                          />
                        ))}
                      </div>
                      <span className="absolute bottom-1 left-1 right-1 text-[9px] text-center text-gray-500 truncate">
                        {layout.name}
                      </span>
                    </button>
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
