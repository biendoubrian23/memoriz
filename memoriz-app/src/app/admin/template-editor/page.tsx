"use client";

/* ─────────────────────────────────────────────────────────────
   Admin — Template Editor — Theme selection page
   Protected: only super_admin can access
   ───────────────────────────────────────────────────────────── */

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/AuthContext";
import Link from "next/link";
import {
  Newspaper,
  Users,
  MapPin,
  Heart,
  Baby,
  ArrowLeft,
  Sparkles,
  Shield,
} from "lucide-react";

const THEMES = [
  {
    id: "magazine",
    label: "Magazine",
    description: "Templates éditoriaux professionnels",
    icon: Newspaper,
    color: "#E74C3C",
    bgGradient: "from-red-500 to-rose-600",
  },
  {
    id: "famille",
    label: "Album Famille",
    description: "Souvenirs de famille chaleureux",
    icon: Users,
    color: "#E91E63",
    bgGradient: "from-pink-500 to-rose-600",
  },
  {
    id: "road-trip",
    label: "Road Trip",
    description: "Carnets de voyage & aventures",
    icon: MapPin,
    color: "#2196F3",
    bgGradient: "from-blue-500 to-cyan-600",
  },
  {
    id: "mariage",
    label: "Mariage",
    description: "Votre plus beau jour",
    icon: Heart,
    color: "#9C27B0",
    bgGradient: "from-purple-500 to-violet-600",
  },
  {
    id: "bebe",
    label: "Bébé · Naissance",
    description: "Les premiers moments précieux",
    icon: Baby,
    color: "#FF9800",
    bgGradient: "from-amber-500 to-orange-600",
  },
];

export default function TemplateEditorPage() {
  const { user, profile, loading, isSuperAdmin } = useAuth();
  const router = useRouter();

  // Redirect non-admin users
  useEffect(() => {
    if (!loading && (!user || !isSuperAdmin)) {
      router.push("/");
    }
  }, [loading, user, isSuperAdmin, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-purple-300 border-t-purple-700 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSuperAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Éditeur de Templates
              </h1>
              <p className="text-xs text-gray-500">
                Super Admin — {profile?.first_name} {profile?.last_name}
              </p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-full">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-semibold text-purple-700">
              Super Admin
            </span>
          </div>
        </div>
      </header>

      {/* Theme grid */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choisissez un thème
          </h2>
          <p className="text-gray-500">
            Sélectionnez un thème pour créer un nouveau template. Les templates
            seront visibles par tous les utilisateurs.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {THEMES.map((theme) => {
            const Icon = theme.icon;
            return (
              <Link
                key={theme.id}
                href={`/admin/template-editor/${theme.id}`}
                className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white hover:shadow-xl hover:border-transparent transition-all duration-300"
              >
                {/* Color top band */}
                <div
                  className={`h-28 bg-gradient-to-br ${theme.bgGradient} flex items-center justify-center`}
                >
                  <Icon className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform" />
                </div>

                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    {theme.label}
                  </h3>
                  <p className="text-sm text-gray-500">{theme.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-purple-600 group-hover:text-purple-800 transition-colors">
                    <Sparkles className="w-4 h-4" />
                    Créer un template
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
