"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sophie Martin",
    product: "Album Notre Histoire",
    text: "Mon mari a pleuré en ouvrant l'album. C'est le plus beau cadeau que j'ai pu lui offrir.",
    rating: 5,
  },
  {
    name: "James Mitchell",
    product: "Magazine Personnalisé",
    text: "Un rendu professionnel incroyable. Ma femme était sans voix en découvrant son magazine.",
    rating: 5,
  },
  {
    name: "Camille Rousseau",
    product: "Album Voyage",
    text: "Notre road trip en famille sublimé. On le feuillette tous les dimanches, un vrai trésor !",
    rating: 5,
  },
  {
    name: "Alejandro Ruiz",
    product: "Album Hommage",
    text: "J'ai créé un album en mémoire de mon grand-père. Memoriz comprend ce que ça signifie.",
    rating: 5,
  },
  {
    name: "Isabella Conti",
    product: "Magazine Anniversaire",
    text: "Ma mère en couverture d'un magazine pour ses 60 ans ! Elle n'en revenait pas.",
    rating: 5,
  },
  {
    name: "Thomas Lefèvre",
    product: "Album Mariage",
    text: "Les photos de notre mariage prennent une tout autre dimension dans cet album. Magnifique.",
    rating: 5,
  },
  {
    name: "Elena Vasquez",
    product: "Album Bébé",
    text: "La première année de notre fille en images. Chaque page est une émotion pure.",
    rating: 5,
  },
  {
    name: "Marco Bellini",
    product: "Magazine Voyage",
    text: "Notre tour d'Europe transformé en magazine. On dirait un vrai Condé Nast !",
    rating: 5,
  },
  {
    name: "Charlotte Dupuis",
    product: "Album Famille",
    text: "Réunir 30 ans de souvenirs en un seul album. Toute la famille était émue aux larmes.",
    rating: 5,
  },
  {
    name: "William Carter",
    product: "Album Couple",
    text: "Offert à ma compagne pour nos 10 ans. Elle l'a serré contre elle sans rien dire.",
    rating: 5,
  },
  {
    name: "Lucia Fernandez",
    product: "Magazine Anniversaire",
    text: "Un cadeau qui a volé la vedette à tous les autres. Tout le monde voulait savoir où le commander.",
    rating: 5,
  },
  {
    name: "Antoine Moreau",
    product: "Album Road Trip",
    text: "3 000 km en van, résumés en 40 pages. Chaque photo retrouve son histoire.",
    rating: 5,
  },
  {
    name: "Giulia Romano",
    product: "Album Grossesse",
    text: "Neuf mois d'attente immortalisés. Ce sera le premier livre de notre bébé.",
    rating: 5,
  },
  {
    name: "Sarah Bennett",
    product: "Magazine Personnalisé",
    text: "J'ai offert un magazine à ma meilleure amie. Elle a cru que c'était un vrai tirage presse.",
    rating: 5,
  },
  {
    name: "Pablo Delgado",
    product: "Album Enterrement de vie",
    text: "Les souvenirs de l'EVJF de ma sœur en album. Fou rire garanti à chaque page.",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark tracking-tight hero-font-heading">
            Ils ont créé, ils ont ému.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-medium-gray max-w-xl mx-auto hero-font-body">
            Des milliers de souvenirs sublimés. Voici ce qu&apos;en disent nos créateurs.
          </p>
        </div>
      </div>

      {/* Infinite scrolling carousel — contained within max-w-7xl */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl">
          {/* Fade edges */}
          <div className="absolute inset-y-0 left-0 w-20 sm:w-36 bg-linear-to-r from-[#fdf6f4] via-[#fdf6f4]/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-20 sm:w-36 bg-linear-to-l from-[#fdf6f4] via-[#fdf6f4]/60 to-transparent z-10 pointer-events-none" />

          {/* Scrolling track */}
          <div className="flex animate-scroll-testimonials hover:[animation-play-state:paused]">
            {/* Render twice for seamless loop */}
            {[...testimonials, ...testimonials].map((t, index) => (
              <div
                key={index}
                className="shrink-0 w-72 sm:w-80 mx-3 bg-white rounded-2xl p-6 shadow-sm"
              >
              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed text-sm italic mb-5 hero-font-body">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm hero-font-body">{t.name}</p>
                  <p className="text-medium-gray text-xs">{t.product}</p>
                </div>
              </div>
            </div>
          ))}
          </div>
        </div>
      </div>
    </section>
  );
}
