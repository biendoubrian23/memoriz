"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Eye, Save, Check } from "lucide-react";
import type { Project } from "@/lib/types/editor";

type Props = {
  project: Project;
  saving: boolean;
  onUpdateTitle: (title: string) => void;
  onPreview: () => void;
};

export default function EditorHeader({ project, saving, onUpdateTitle, onPreview }: Props) {
  const router = useRouter();
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState(project.title);

  const handleTitleSubmit = () => {
    onUpdateTitle(titleValue);
    setEditingTitle(false);
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 z-50">
      {/* Back */}
      <button
        onClick={() => router.push("/")}
        className="flex items-center gap-2 text-medium-gray hover:text-dark transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <Image
          src="/images/logo (2).png"
          alt="Memoriz"
          width={100}
          height={30}
          className="h-7 w-auto"
          style={{ width: 'auto', height: 'auto' }}
        />
      </button>

      {/* Separator */}
      <div className="w-px h-6 bg-gray-200" />

      {/* Title */}
      {editingTitle ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleTitleSubmit();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            autoFocus
            onBlur={handleTitleSubmit}
            className="text-sm font-medium text-dark border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </form>
      ) : (
        <button
          onClick={() => setEditingTitle(true)}
          className="text-sm font-medium text-dark hover:text-primary transition-colors"
        >
          {project.title}
        </button>
      )}

      {/* Saving indicator */}
      {saving && (
        <span className="text-xs text-medium-gray flex items-center gap-1">
          <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Sauvegarde...
        </span>
      )}

      <div className="flex-1" />

      {/* Auto-save info */}
      <span className="hidden sm:flex items-center gap-1 text-xs text-green-600">
        <Check className="w-3 h-3" />
        Sauvegardé
      </span>

      {/* Preview */}
      <button
        onClick={onPreview}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-dark border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Eye className="w-4 h-4" />
        <span className="hidden sm:inline">Aperçu</span>
      </button>

      {/* Add to cart */}
      <button className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm">
        <Save className="w-4 h-4" />
        <span className="hidden sm:inline">Ajouter au panier</span>
      </button>
    </header>
  );
}
