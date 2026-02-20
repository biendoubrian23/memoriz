"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  Plus,
  BookOpen,
  Calendar,
  Loader2,
  Trash2,
  FolderOpen,
  LogOut,
  ArrowLeft,
} from "lucide-react";

type ProjectItem = {
  id: string;
  title: string;
  product_type: string;
  status: string;
  created_at: string;
  updated_at: string;
  cover_image_url?: string;
};

export default function MesProjetsPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/connexion");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("projects")
        .select("id, title, product_type, status, created_at, updated_at, cover_image_url")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (data) setProjects(data as ProjectItem[]);
      setLoading(false);
    };
    fetchProjects();
  }, [user, supabase]);

  const handleDelete = async (projectId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Supprimer ce projet ? Cette action est irréversible.")) return;
    setDeleting(projectId);
    await supabase.from("projects").delete().eq("id", projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setDeleting(null);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft": return "Brouillon";
      case "completed": return "Terminé";
      case "ordered": return "Commandé";
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-amber-100 text-amber-700";
      case "completed": return "bg-green-100 text-green-700";
      case "ordered": return "bg-blue-100 text-blue-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) return user.email[0].toUpperCase();
    return "U";
  };

  if (authLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* ── Header (style éditeur) ──────────────────────── */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-4 shrink-0 z-50">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 text-medium-gray hover:text-dark transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <Image
            src="/images/logo (2).png"
            alt="Memoriz"
            width={100}
            height={30}
            className="h-7 w-auto"
            style={{ width: "auto", height: "auto" }}
          />
        </Link>

        <div className="w-px h-6 bg-gray-200" />

        <h1 className="text-sm font-semibold text-dark">Mes projets</h1>

        <div className="flex-1" />

        {/* Nouveau projet */}
        <Link
          href="/creer"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nouveau projet</span>
        </Link>
      </header>

      {/* ── Body ────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────── */}
        <div className="w-16 bg-white border-r border-gray-200 flex flex-col items-center py-3 gap-1 shrink-0">
          {/* Projets tab (active) */}
          <div
            className="w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 bg-primary/10 text-primary"
            title="Mes projets"
          >
            <FolderOpen className="w-5 h-5" />
            <span className="text-[10px] leading-none font-medium">Projets</span>
          </div>

          <div className="flex-1" />

          {/* User avatar + logout */}
          <div className="flex flex-col items-center gap-2 pb-2">
            <div
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold cursor-default"
              title={profile?.first_name ? `${profile.first_name} ${profile.last_name}` : user?.email ?? ""}
            >
              {getInitials()}
            </div>
            <button
              onClick={() => signOut()}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
              title="Se déconnecter"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main content ────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Title section */}
            <div className="mb-8">
              <p className="text-medium-gray">
                {projects.length === 0
                  ? "Vous n'avez pas encore de projet"
                  : `${projects.length} projet${projects.length > 1 ? "s" : ""}`}
              </p>
            </div>

            {/* Projects grid */}
            {projects.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 text-center border border-gray-100">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-dark mb-2">Aucun projet pour le moment</h2>
                <p className="text-medium-gray mb-6 max-w-md mx-auto">
                  Créez votre premier album photo, magazine ou livre personnalisé en quelques clics.
                </p>
                <Link
                  href="/creer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md"
                >
                  <Plus size={18} />
                  Créer mon premier projet
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/editeur/${project.id}`}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-primary/20 transition-all duration-300"
                  >
                    {/* Cover image */}
                    <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
                      {project.cover_image_url ? (
                        <Image
                          src={project.cover_image_url}
                          alt={project.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-gray-300" />
                        </div>
                      )}
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDelete(project.id, e)}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 text-gray-400 hover:text-red-500 hover:bg-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        title="Supprimer"
                      >
                        {deleting === project.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-dark group-hover:text-primary transition-colors truncate">
                          {project.title}
                        </h3>
                        <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-medium-gray">
                        <Calendar size={12} />
                        Modifié le {formatDate(project.updated_at)}
                      </div>
                    </div>
                  </Link>
                ))}

                {/* New project card */}
                <Link
                  href="/creer"
                  className="group bg-white rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 hover:border-primary/40 transition-all duration-300 flex items-center justify-center min-h-[280px]"
                >
                  <div className="text-center p-6">
                    <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-primary/10 flex items-center justify-center mx-auto mb-3 transition-colors">
                      <Plus size={24} className="text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <p className="text-sm font-medium text-medium-gray group-hover:text-primary transition-colors">
                      Nouveau projet
                    </p>
                  </div>
                </Link>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
