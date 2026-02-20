"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  Maximize2,
  FileText,
  Layers,
  Palette,
} from "lucide-react";

/* ───────── TYPES ───────── */
type OptionItem = {
  slug: string;
  name: string;
  subtitle?: string;
  description: string;
  price: number; // prix en backend, jamais affiché
  image?: string;
  gradient?: string; // CSS gradient pour impression
  recommended?: boolean;
};

type StepConfig = {
  key: string;
  label: string; // label court pour le récap
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  options: OptionItem[];
};

/* ───────── DATA ───────── */
const bindingOptions: OptionItem[] = [
  {
    slug: "dos-carre-colle",
    name: "Dos carré collé",
    subtitle: "Type roman",
    description: "Reliure professionnelle avec dos plat collé. Idéale pour les albums et livres photo haut de gamme.",
    price: 2.0,
    image: "/images/reliures/dos-carre-colle.jpeg",
  },
  {
    slug: "remborde",
    name: "Rembordé",
    subtitle: "Type BD",
    description: "Reliure rembordée avec couverture rigide. Parfaite pour les beaux livres et albums premium.",
    price: 3.5,
    image: "/images/reliures/remborde.jpeg",
  },
  {
    slug: "agrafe",
    name: "Agrafé",
    subtitle: "Type magazine",
    description: "Reliure agrafée au centre. Idéale pour les magazines et brochures jusqu'à 48 pages.",
    price: 1.0,
    image: "/images/reliures/agrafe.jpeg",
  },
];

const formatOptions: OptionItem[] = [
  {
    slug: "a4-portrait",
    name: "A4 Portrait",
    subtitle: "21 × 29,7 cm",
    description: "Format classique vertical. Idéal pour les albums de famille et les portraits.",
    price: 29.9,
    image: "/images/format/A4%20portrait.jpeg",
  },
  {
    slug: "a4-paysage",
    name: "A4 Paysage",
    subtitle: "29,7 × 21 cm",
    description: "Format horizontal panoramique. Parfait pour les photos de voyage et paysages.",
    price: 29.9,
    image: "/images/format/paysage.jpeg",
  },
  {
    slug: "carre-21",
    name: "Carré",
    subtitle: "21 × 21 cm",
    description: "Format carré tendance. Moderne et élégant, s'adapte à tous les styles.",
    price: 24.9,
    image: "/images/format/carr%C3%A9.jpeg",
  },
];

const paperOptions: OptionItem[] = [
  {
    slug: "standard-90",
    name: "Standard",
    subtitle: "90g blanc",
    description: "Papier standard blanc, bon rapport qualité/prix pour les projets du quotidien.",
    price: 0,
    image: "/images/papier/Standard.jpg",
  },
  {
    slug: "doux-80",
    name: "Doux",
    subtitle: "80g blanc",
    description: "Papier doux au toucher avec un rendu agréable et une bonne tenue des couleurs.",
    price: 0.5,
    image: "/images/papier/doux.jpg",
  },
  {
    slug: "creme-ancien-80",
    name: "Crème / Ancien",
    subtitle: "80g beige",
    description: "Papier teinté beige pour un rendu vintage et chaleureux. Idéal pour les albums nostalgiques.",
    price: 0.5,
    image: "/images/papier/cr%C3%A8me_ancien.jpg",
  },
  {
    slug: "lisse-satin-115",
    name: "Lisse satin",
    subtitle: "115g blanc",
    description: "Papier satiné lisse avec un léger reflet soyeux. Couleurs fidèles et rendu élégant.",
    price: 1.5,
    image: "/images/papier/lisse%20satin.jpg",
  },
  {
    slug: "premium-photo-170",
    name: "Premium Photo",
    subtitle: "170g blanc",
    description: "Papier photo premium épais. Rendu photographique professionnel, couleurs éclatantes.",
    price: 3.0,
    image: "/images/papier/premium%20photo.jpg",
    recommended: true,
  },
];

const laminationOptions: OptionItem[] = [
  {
    slug: "brillant",
    name: "Brillant",
    subtitle: "Effet Glossy",
    description: "Finition brillante sur la couverture. Couleurs vives et éclatantes, effet « wow » garanti.",
    price: 0,
    image: "/images/pelliculage/brillant.png",
  },
  {
    slug: "mat",
    name: "Mat",
    subtitle: "Effet matifié",
    description: "Finition mate sur la couverture. Toucher doux et velouté, aspect premium et moderne.",
    price: 0,
    image: "/images/pelliculage/mat.png",
  },
  {
    slug: "soft-touch",
    name: "Soft Touch",
    subtitle: "Toucher velours",
    description: "Finition veloutée ultra-douce au toucher. Sensation de luxe, résistant aux traces de doigts.",
    price: 4.0,
    image: "/images/pelliculage/soft-touch.png",
  },
];

const printingOptions: OptionItem[] = [
  {
    slug: "couleur",
    name: "Couleur",
    description: "L'intérieur de mon livre a des pages en couleurs. Rendu photographique haute définition.",
    price: 0,
    gradient: "bg-linear-to-br from-yellow-300 via-pink-400 via-purple-500 to-blue-500",
  },
  {
    slug: "noir-blanc",
    name: "Noir et blanc",
    description: "L'intérieur de mon livre sera imprimé en N&B. Rendu artistique et intemporel.",
    price: 0,
    gradient: "bg-linear-to-br from-gray-900 via-gray-500 to-gray-100",
  },
];

const steps: StepConfig[] = [
  {
    key: "binding",
    label: "Reliure",
    title: "Choisissez votre reliure",
    subtitle: "Le type de reliure définit la tenue et le style de votre album",
    icon: <BookOpen className="w-5 h-5" />,
    options: bindingOptions,
  },
  {
    key: "format",
    label: "Format",
    title: "Choisissez votre format",
    subtitle: "Le format idéal dépend de vos photos et de l'usage prévu",
    icon: <Maximize2 className="w-5 h-5" />,
    options: formatOptions,
  },
  {
    key: "paper",
    label: "Papier",
    title: "Papier intérieur",
    subtitle: "Le grammage et la finition du papier influencent le rendu de vos photos",
    icon: <FileText className="w-5 h-5" />,
    options: paperOptions,
  },
  {
    key: "lamination",
    label: "Pelliculage",
    title: "Pelliculage couverture",
    subtitle: "La finition extérieure de votre album pour un toucher unique",
    icon: <Layers className="w-5 h-5" />,
    options: laminationOptions,
  },
  {
    key: "printing",
    label: "Impression",
    title: "Impression intérieure",
    subtitle: "Couleur éclatante ou noir & blanc artistique",
    icon: <Palette className="w-5 h-5" />,
    options: printingOptions,
  },
];

/* ───────── COMPONENT ───────── */
export default function CreerPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <CreerWizard />
    </Suspense>
  );
}

function CreerWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [showConnectPrompt, setShowConnectPrompt] = useState(false);
  const [creatingProject, setCreatingProject] = useState(false);

  // If user just came back from auth (connect-success), create project and redirect to editor
  useEffect(() => {
    if (searchParams.get("step") === "connect-success" && user && !authLoading) {
      const pending = localStorage.getItem("memoriz_pending_config");
      if (pending) {
        createProjectAndRedirect(JSON.parse(pending));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, user, authLoading]);

  async function createProjectAndRedirect(config: Record<string, string>) {
    setCreatingProject(true);
    try {
      const supabase = createClient();

      // Fetch IDs from slugs
      const [bindingRes, formatRes, paperRes, laminationRes, printingRes] =
        await Promise.all([
          supabase
            .from("binding_types")
            .select("id")
            .eq("slug", config.binding)
            .single(),
          supabase
            .from("formats")
            .select("id")
            .eq("slug", config.format)
            .single(),
          supabase
            .from("paper_types")
            .select("id")
            .eq("slug", config.paper)
            .single(),
          supabase
            .from("lamination_types")
            .select("id")
            .eq("slug", config.lamination)
            .single(),
          supabase
            .from("printing_types")
            .select("id")
            .eq("slug", config.printing)
            .single(),
        ]);

      // Check all lookups succeeded
      const lookupErrors = [
        bindingRes.error && `Reliure (${config.binding}): ${bindingRes.error.message}`,
        formatRes.error && `Format (${config.format}): ${formatRes.error.message}`,
        paperRes.error && `Papier (${config.paper}): ${paperRes.error.message}`,
        laminationRes.error && `Pelliculage (${config.lamination}): ${laminationRes.error.message}`,
        printingRes.error && `Impression (${config.printing}): ${printingRes.error.message}`,
      ].filter(Boolean);

      if (lookupErrors.length > 0) {
        console.error("Lookup errors:", lookupErrors);
        throw new Error(`Options introuvables en base: ${lookupErrors.join(", ")}`);
      }

      // Create project
      const { data: project, error } = await supabase
        .from("projects")
        .insert({
          user_id: user!.id,
          title: "Mon album",
          product_type: "album",
          binding_type_id: bindingRes.data?.id,
          format_id: formatRes.data?.id,
          paper_type_id: paperRes.data?.id,
          lamination_type_id: laminationRes.data?.id,
          printing_type_id: printingRes.data?.id,
          status: "draft",
        })
        .select("id")
        .single();

      if (error) throw error;

      // Create initial pages: cover + 4 content + back cover
      const initialPages = [
        { project_id: project.id, page_number: 0, page_type: "cover", layout_id: "cover-full" },
        { project_id: project.id, page_number: 1, page_type: "content", layout_id: "1-full" },
        { project_id: project.id, page_number: 2, page_type: "content", layout_id: "2-horizontal" },
        { project_id: project.id, page_number: 3, page_type: "content", layout_id: "4-grid" },
        { project_id: project.id, page_number: 4, page_type: "content", layout_id: "1-full" },
        { project_id: project.id, page_number: 5, page_type: "back_cover", layout_id: "cover-centered" },
      ];

      await supabase.from("project_pages").insert(initialPages);

      // Clean up localStorage
      localStorage.removeItem("memoriz_pending_config");

      // Redirect to editor
      router.push(`/editeur/${project.id}`);
    } catch (err) {
      console.error("Error creating project:", err);
      setCreatingProject(false);
    }
  }

  const handleSelect = (slug: string) => {
    setSelections((prev) => ({
      ...prev,
      [steps[currentStep].key]: slug,
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // All steps done — check if user is logged in
      if (user) {
        createProjectAndRedirect(selections);
      } else {
        // Save to localStorage and show connect prompt
        localStorage.setItem(
          "memoriz_pending_config",
          JSON.stringify(selections)
        );
        setShowConnectPrompt(true);
      }
    }
  };

  const handleBack = () => {
    if (showConnectPrompt) {
      setShowConnectPrompt(false);
    } else if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  const currentSelected = selections[steps[currentStep]?.key];

  // If creating project, show loading
  if (creatingProject) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-dark mb-2">
            Création de votre album...
          </h2>
          <p className="text-medium-gray">
            Nous préparons votre espace de création
          </p>
        </div>
      </div>
    );
  }

  // Connect prompt screen
  if (showConnectPrompt) {
    return (
      <div className="pt-20 min-h-screen flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* Decorative icon */}
          <div className="w-24 h-24 bg-linear-to-br from-primary/10 to-accent/10 rounded-full flex items-center justify-center mx-auto mb-8">
            <svg
              className="w-12 h-12 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-dark mb-3">
            Connectez-vous pour continuer
          </h1>
          <p className="text-medium-gray text-lg mb-2">
            Votre configuration est sauvegardée !
          </p>
          <p className="text-medium-gray mb-10">
            Connectez-vous ou créez un compte pour ajouter vos photos et
            concevoir votre album personnalisé.
          </p>

          {/* Summary of selections */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8 text-left">
            <h3 className="text-sm font-semibold text-dark mb-4 uppercase tracking-wider">
              Votre configuration
            </h3>
            <div className="space-y-3">
              {steps.map((step) => {
                const sel = step.options.find(
                  (o) => o.slug === selections[step.key]
                );
                return sel ? (
                  <div
                    key={step.key}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-medium-gray">{step.label}</span>
                    <span className="font-medium text-dark">{sel.name}</span>
                  </div>
                ) : null;
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/connexion"
              className="px-8 py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md hover:shadow-lg"
            >
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="px-8 py-3.5 border-2 border-primary text-primary font-semibold rounded-full hover:bg-primary/5 transition-all"
            >
              Créer un compte
            </Link>
          </div>

          <button
            onClick={handleBack}
            className="mt-6 text-sm text-medium-gray hover:text-dark transition-colors"
          >
            ← Modifier ma configuration
          </button>
        </div>
      </div>
    );
  }

  const step = steps[currentStep];

  return (
    <div className="pt-20 min-h-screen pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Progress bar */}
        <div className="pt-8 pb-10">
          <div className="flex items-center justify-between mb-4">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center flex-1 last:flex-initial">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    i < currentStep
                      ? "bg-primary text-white"
                      : i === currentStep
                      ? "bg-primary text-white shadow-lg shadow-primary/30 scale-110"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    i + 1
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        i < currentStep ? "bg-primary" : "bg-gray-100"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <span
                key={s.key}
                className={`text-xs font-medium transition-colors ${
                  i <= currentStep ? "text-dark" : "text-gray-300"
                } ${i === 0 ? "text-left" : i === steps.length - 1 ? "text-right" : "text-center"}`}
                style={{ width: `${100 / steps.length}%` }}
              >
                {s.label}
              </span>
            ))}
          </div>
        </div>

        {/* Main content */}
        <div>
            {/* Step header */}
            <div className="text-center mb-10">
              <p className="text-sm text-medium-gray font-medium mb-2">
                Étape {currentStep + 1} sur {steps.length}
              </p>
              <h1 className="text-3xl sm:text-4xl font-bold text-dark mb-3">
                {step.title}
              </h1>
              <p className="text-medium-gray text-lg">{step.subtitle}</p>
            </div>

            {/* Options grid */}
            <div
              className={`grid gap-4 mb-12 ${
                step.options.length <= 2
                  ? "grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto"
                  : step.options.length <= 3
                  ? "grid-cols-1 sm:grid-cols-3"
                  : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
              }`}
            >
              {step.options.map((option) => {
                const isSelected = currentSelected === option.slug;
                return (
                  <button
                    key={option.slug}
                    onClick={() => handleSelect(option.slug)}
                    className={`relative group text-left rounded-2xl border-2 p-5 transition-all duration-300 hover:shadow-lg ${
                      isSelected
                        ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                        : "border-gray-100 bg-white hover:border-gray-200"
                    }`}
                  >
                    {/* Recommended badge */}
                    {option.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full whitespace-nowrap">
                        Recommandé
                      </div>
                    )}

                    {/* Check badge — z-20 to stay above image */}
                    <div
                      className={`absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all z-20 ${
                        isSelected
                          ? "bg-primary text-white scale-100 shadow-md"
                          : "bg-white/80 backdrop-blur text-transparent scale-75 border border-gray-200"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                    </div>

                    {/* Image / Gradient / Icon */}
                    {option.image ? (
                      <div className={`w-full rounded-xl bg-gray-50 mb-3 overflow-hidden relative ${step.options.length > 3 ? "aspect-square" : "h-36"}`}>
                        <Image
                          src={option.image}
                          alt={option.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, 20vw"
                        />
                      </div>
                    ) : option.gradient ? (
                      <div
                        className={`w-full rounded-xl mb-3 ${step.options.length > 3 ? "aspect-square" : "h-36"} ${option.gradient}`}
                      />
                    ) : (
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                          isSelected
                            ? "bg-primary/10 text-primary"
                            : "bg-gray-50 text-gray-400 group-hover:text-gray-600"
                        }`}
                      >
                        {step.icon}
                      </div>
                    )}

                    <h3 className={`font-bold text-dark mb-0.5 ${step.options.length > 3 ? "text-sm" : "text-base"}`}>
                      {option.name}
                    </h3>
                    {option.subtitle && (
                      <p className="text-xs font-medium text-primary/70 mb-1">
                        {option.subtitle}
                      </p>
                    )}
                    {step.options.length <= 3 && (
                      <p className="text-xs text-medium-gray leading-relaxed">
                        {option.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                  currentStep === 0
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-dark hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="w-4 h-4" />
                Retour
              </button>

              <button
                onClick={handleNext}
                disabled={!currentSelected}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold transition-all ${
                  currentSelected
                    ? "bg-primary text-white hover:bg-primary-dark shadow-md hover:shadow-lg"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {currentStep === steps.length - 1 ? (
                  <>
                    Commencer la création
                    <ArrowRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>

      </div>
    </div>
  );
}
