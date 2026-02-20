"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";

/* ── 5 unique blob border-radius shapes (organic, large — ~85%+ image visible) ── */
const blobStyles: React.CSSProperties[] = [
  // 1 – soft asymmetric drop (Drag & Drop)
  { borderRadius: "60% 40% 45% 55% / 50% 60% 40% 50%" },
  // 2 – rounded wobble (Impression directe)
  { borderRadius: "40% 60% 55% 45% / 60% 40% 55% 45%" },
  // 3 – diagonal (Sans Canva)
  { borderRadius: "20% 60% 20% 60% / 60% 20% 60% 20%" },
  // 4 – organic pebble (Personnalisable)
  { borderRadius: "30% 70% 55% 45% / 65% 35% 60% 40%" },
  // 5 – elongated organic (Voyages)
  { borderRadius: "50% 50% 40% 60% / 55% 45% 60% 40%" },
];

/* ── Background blob (slightly different + bigger) ── */
const bgBlobStyles: React.CSSProperties[] = [
  { borderRadius: "55% 45% 50% 50% / 45% 55% 45% 55%" },
  { borderRadius: "45% 55% 50% 50% / 55% 45% 50% 50%" },
  { borderRadius: "25% 55% 25% 55% / 55% 25% 55% 25%" },
  { borderRadius: "50% 50% 45% 55% / 50% 50% 55% 45%" },
  { borderRadius: "55% 45% 45% 55% / 50% 50% 45% 55%" },
];

/* ── Accent colors per feature ── */
const accentColors = [
  "bg-primary/15",
  "bg-violet-300/30",
  "bg-amber-300/30",
  "bg-emerald-300/30",
  "bg-rose-300/30",
];

const dotColors = [
  "bg-primary/40",
  "bg-violet-400/50",
  "bg-amber-400/50",
  "bg-emerald-400/50",
  "bg-rose-400/50",
];

const features = [
  {
    image: "/images/section3/31.png",
    badge: "Drag & Drop",
    title: "Des templates prêts à l'emploi, il suffit de glisser vos photos",
    description:
      "Choisissez parmi nos dizaines de templates professionnels et glissez-déposez vos photos. Pas besoin de compétences en design — le résultat est garanti dès le premier essai.",
    highlights: ["Templates pro inclus", "Glisser-déposer intuitif", "Résultat immédiat"],
    cta: "Utiliser ce template",
  },
  {
    image: "/images/section3/le3.jpeg",
    badge: "Impression directe",
    title: "Créez et imprimez en quelques clics. C'est aussi simple que ça",
    description:
      "Une fois votre création terminée, commandez l'impression en un clic. Recevez chez vous un livre de qualité premium, relié et prêt à offrir.",
    highlights: ["Impression haute qualité", "Livraison à domicile", "Prêt à offrir"],
    cta: "Créer mon album",
  },
  {
    image: "/images/section3/32.jpg",
    badge: "Sans Canva",
    title: "Oubliez Canva. Ici, tout est déjà pensé pour vous",
    description:
      "Pas d'abonnement, pas de courbe d'apprentissage. Nos mises en page sont designées par des pros. Vous n'ajoutez que vos souvenirs — on s'occupe du reste.",
    highlights: ["Zéro abonnement", "Pas de compétences requises", "Design professionnel"],
    cta: "Commencer maintenant",
  },
  {
    image: "/images/section3/33.png",
    badge: "Personnalisable",
    title: "Ajoutez textes, stickers et emojis pour un rendu unique",
    description:
      "Votre livre, votre style. Personnalisez chaque page avec vos mots, vos stickers favoris et des emojis. Faites de chaque double page une œuvre à votre image.",
    highlights: ["Textes personnalisés", "Stickers & emojis", "100% vous"],
    cta: "Personnaliser le mien",
  },
  {
    image: "/images/section3/35.jpeg",
    badge: "Voyages",
    title: "Vos aventures méritent mieux qu'un album photo classique",
    description:
      "Transformez vos souvenirs de voyage en un véritable livre magazine. Du template au livre imprimé, tout se fait en quelques minutes sans effort.",
    highlights: ["Carnet de voyage premium", "Templates thématiques", "Du digital au papier"],
    cta: "Créer mon carnet",
  },
];

export default function DragDropSection() {
  const { user } = useAuth();
  const ctaHref = user ? "/mes-projets" : "/creer";

  return (
    <section id="drag-drop" className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-dark tracking-tight hero-font-heading">
            Créez votre livre en quelques minutes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-medium-gray max-w-2xl mx-auto hero-font-body">
            Des templates magnifiques, du drag & drop et une impression directe.
            Pas besoin de Canva ni de talent artistique.
          </p>
        </div>

        {/* Alternating feature rows */}
        <div className="flex flex-col gap-14 lg:gap-20">
          {features.map((feature, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={feature.title}
                className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-8 lg:gap-14`}
              >
                {/* Image with blob shape */}
                <div className="w-full lg:w-[45%]">
                  <div className="relative flex items-center justify-center py-4">
                    {/* Background blob (slightly larger, blurred) */}
                    <div
                      className={`absolute inset-2 ${accentColors[index]} blur-2xl`}
                      style={bgBlobStyles[index]}
                    />

                    {/* Main blob image */}
                    <div
                      className="group relative overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-500 w-full aspect-square"
                      style={blobStyles[index]}
                    >
                      <Image
                        src={feature.image}
                        alt={feature.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 1024px) 100vw, 45vw"
                      />
                      {/* Overlay + CTA */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                        <Link
                          href={ctaHref}
                          className="opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-300 px-6 py-3 bg-white text-dark font-semibold text-sm rounded-full shadow-lg hover:bg-primary hover:text-white hero-font-body"
                        >
                          {feature.cta} →
                        </Link>
                      </div>
                    </div>

                    {/* Decorative dots */}
                    <div className={`absolute ${isReversed ? "-left-2 top-8" : "-right-2 top-8"} w-5 h-5 rounded-full ${dotColors[index]}`} />
                    <div className={`absolute ${isReversed ? "right-4 -bottom-1" : "left-4 -bottom-1"} w-3 h-3 rounded-full ${dotColors[index]}`} />
                    <div className={`absolute ${isReversed ? "left-10 -bottom-2" : "right-10 -bottom-2"} w-2 h-2 rounded-full ${accentColors[index]}`} />
                  </div>
                </div>

                {/* Text content */}
                <div className="w-full lg:w-[55%]">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 hero-font-body">
                    {feature.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark leading-snug hero-font-heading">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base text-medium-gray leading-relaxed hero-font-body">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <ul className="mt-6 flex flex-col gap-3">
                    {feature.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-center gap-3 text-sm font-medium text-dark hero-font-body"
                      >
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg
                            className="w-3.5 h-3.5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
