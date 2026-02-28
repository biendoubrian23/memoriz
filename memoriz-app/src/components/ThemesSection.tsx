"use client";

import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";

const themes = [
  {
    image: "/images/section2/love.jpeg",
    title: "Couple & Amour",
    description: "Racontez votre histoire d'amour dans un livre unique…",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/famille.jpeg",
    title: "Famille",
    description: "Réunissez vos plus beaux moments en famille…",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/anniversaire.jpeg",
    title: "Anniversaire & Fêtes",
    description: "Offrez un cadeau qui marquera les esprits…",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/voyage.jpeg",
    title: "Voyage & Aventure",
    description: "Transformez vos escapades en carnet de voyage…",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/netflix.jpeg",
    title: "Style Netflix",
    description: "Un album au look cinématographique pour vos souvenirs…",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/Roadtrip.jpeg",
    title: "Road Trip",
    description: "Chaque kilomètre raconte une histoire…",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/fun.jpeg",
    title: "Soirées & Fun",
    description: "Les meilleurs moments entre amis méritent plus…",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/mygoal.jpeg",
    title: "About Me",
    description: "Un livre qui parle de vous et de vos rêves…",
    ctaHref: "/creer",
  },
];

export default function ThemesSection() {
  const { user } = useAuth();

  return (
    <section id="themes" className="pt-10 pb-16 bg-[#fdf2f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-dark tracking-tight hero-font-heading">
            Choisissez votre thématique
          </h2>
          <p className="mt-3 text-base sm:text-lg text-medium-gray max-w-xl mx-auto hero-font-body">
            Chaque moment mérite son propre style. Sélectionnez le thème qui vous ressemble.
          </p>
        </div>

        {/* Grid layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 mt-8">
          {themes.map((theme) => (
            <Link
              key={theme.title}
              href={user ? "/mes-projets" : theme.ctaHref}
              className="group flex flex-col overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
            >
              {/* Text Content */}
              <div className="p-4 sm:p-6 pb-2 sm:pb-4 flex-1">
                <h3 className="text-sm sm:text-lg font-bold text-[#1e3a8a] mb-1 sm:mb-2 font-display">
                  {theme.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 line-clamp-3">
                  {theme.description}
                </p>
              </div>

              {/* Image Content */}
              <div className="relative w-full aspect-[4/3] lg:aspect-square mt-auto">
                <div className="relative w-full h-full overflow-hidden rounded-t-[1.5rem] sm:rounded-t-[2rem]">
                  <Image
                    src={theme.image}
                    alt={theme.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="px-6 py-2.5 bg-white/95 backdrop-blur-sm text-primary font-bold text-sm uppercase tracking-wider rounded-full shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                      Choisir
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
