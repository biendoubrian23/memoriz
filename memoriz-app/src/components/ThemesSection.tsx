"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

const themes = [
  {
    image: "/images/section2/love.jpeg",
    title: "Couple & Amour",
    description: "Racontez votre histoire d'amour dans un livre unique…",
    cta: "Créer notre histoire",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/famille.jpeg",
    title: "Famille",
    description: "Réunissez vos plus beaux moments en famille…",
    cta: "Créer mon album",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/anniversaire.jpeg",
    title: "Anniversaire & Fêtes",
    description: "Offrez un cadeau qui marquera les esprits…",
    cta: "Préparer la surprise",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/voyage.jpeg",
    title: "Voyage & Aventure",
    description: "Transformez vos escapades en carnet de voyage…",
    cta: "Revivre mes voyages",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/netflix.jpeg",
    title: "Style Netflix",
    description: "Un album au look cinématographique pour vos souvenirs…",
    cta: "Créer mon histoire",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/Roadtrip.jpeg",
    title: "Road Trip",
    description: "Chaque kilomètre raconte une histoire…",
    cta: "Immortaliser mon road trip",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/fun.jpeg",
    title: "Soirées & Fun",
    description: "Les meilleurs moments entre amis méritent plus…",
    cta: "Revivre la soirée",
    ctaHref: "/creer",
  },
  {
    image: "/images/section2/mygoal.jpeg",
    title: "About Me",
    description: "Un livre qui parle de vous et de vos rêves…",
    cta: "Créer mon portrait",
    ctaHref: "/creer",
  },
];

export default function ThemesSection() {
  const { user } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = scrollRef.current.querySelector("a")?.offsetWidth ?? 280;
    const gap = 20;
    const isMobile = window.innerWidth < 640;
    const count = isMobile ? 1 : 2;
    const amount = (cardWidth + gap) * count;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section id="themes" className="pt-3 pb-10">
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

        {/* Scroll wrapper with overlaying arrows + edge gradients */}
        <div className="relative">
          {/* Left gradient fade */}
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-4 w-16 sm:w-24 z-10 transition-opacity duration-300 theme-fade-left ${canScrollLeft ? "opacity-100" : "opacity-0"}`}
          />

          {/* Right gradient fade */}
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-4 w-16 sm:w-24 z-10 transition-opacity duration-300 theme-fade-right ${canScrollRight ? "opacity-100" : "opacity-0"}`}
          />

          {/* Left arrow */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="flex absolute left-1 sm:left-3 top-[30%] sm:top-[35%] -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 shadow-lg backdrop-blur-sm items-center justify-center text-primary hover:bg-white hover:shadow-xl transition-all duration-200"
              aria-label="Précédent"
            >
              <ChevronLeft size={18} className="sm:hidden" strokeWidth={2.5} />
              <ChevronLeft size={22} className="hidden sm:block" strokeWidth={2.5} />
            </button>
          )}

          {/* Right arrow */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="flex absolute right-1 sm:right-3 top-[30%] sm:top-[35%] -translate-y-1/2 z-20 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/90 shadow-lg backdrop-blur-sm items-center justify-center text-primary hover:bg-white hover:shadow-xl transition-all duration-200"
              aria-label="Suivant"
            >
              <ChevronRight size={18} className="sm:hidden" strokeWidth={2.5} />
              <ChevronRight size={22} className="hidden sm:block" strokeWidth={2.5} />
            </button>
          )}

          {/* Scrollable themes row */}
          <div
            ref={scrollRef}
            className="flex gap-5 sm:gap-6 overflow-x-auto scroll-container pb-4"
          >
            {themes.map((theme) => (
              <Link
                key={theme.title}
                href={user ? "/mes-projets" : theme.ctaHref}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-soft-gray transition-all duration-300 hover:shadow-xl hover:-translate-y-1 shrink-0 w-[46%] sm:w-[30%] lg:w-[23%]"
              >
                {/* Image */}
                <div className="relative aspect-3/4 overflow-hidden">
                  <Image
                    src={theme.image}
                    alt={theme.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 23vw"
                  />
                  {/* Gradient overlay at bottom */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
                  {/* Title on image */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-tight hero-font-heading">
                      {theme.title}
                    </h3>
                  </div>
                </div>

                {/* Description + CTA */}
                <div className="flex flex-col flex-1 p-4 sm:p-5">
                  <p className="text-sm text-medium-gray leading-relaxed hero-font-body line-clamp-2">
                    {theme.description}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-2.5 transition-all duration-300 hero-font-body">
                    {theme.cta}
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
