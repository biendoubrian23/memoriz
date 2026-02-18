"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    image: "/images/hero/album/album1.jpeg",
    h1: "Vos souvenirs méritent mieux qu'un écran.",
    subtitle:
      "Transformez vos moments de vie en albums, magazines et livres personnalisés, conçus pour être ressentis, pas simplement regardés.",
    cta: "Créer mon souvenir",
    ctaIcon: "👉",
    ctaHref: "/albums",
  },
  {
    image: "/images/hero/magazine/magazine0.jpeg",
    h1: "Offrez plus qu'un cadeau. Offrez une émotion.",
    subtitle:
      "Albums photo, magazines et livres de mots croisés personnalisés, créés à partir de votre histoire, avec un design premium.",
    cta: "Créer un cadeau inoubliable",
    ctaIcon: "🎁",
    ctaHref: "/albums",
  },
  {
    image: "/images/hero/album/album2.jpeg",
    h1: "Créez des souvenirs personnalisés, beaux et émouvants.",
    subtitle:
      "Albums photo émotionnels, magazines personnalisés et livres de mots croisés, guidés automatiquement, sans compétences créatives.",
    cta: "Commencer la création",
    ctaIcon: "✨",
    ctaHref: "/albums",
  },
  {
    image: "/images/hero/magazine/magazine1.jpeg",
    h1: "Vos souvenirs, mis en page comme un magazine.",
    subtitle:
      "Un design élégant, une création guidée, et des produits personnalisés qui racontent votre histoire.",
    cta: "Créer mon livre personnalisé",
    ctaIcon: "📖",
    ctaHref: "/magazines",
  },
  {
    image: "/images/hero/album/album3.jpeg",
    h1: "Chaque souvenir a une histoire. Memoriz la sublime.",
    subtitle:
      "Créez des albums, magazines et jeux personnalisés qui font revivre les moments qui comptent vraiment.",
    cta: "Donner vie à mes souvenirs",
    ctaIcon: "❤️",
    ctaHref: "/albums",
  },
  {
    image: "/images/hero/magazine/magazine2.jpg",
    h1: "Pas juste des photos. Des histoires à feuilleter.",
    subtitle:
      "Albums émotionnels, magazines personnalisés et livres de mots croisés générés à partir de votre histoire.",
    cta: "Découvrir Memoriz",
    ctaIcon: "🚀",
    ctaHref: "/magazines",
  },
  {
    image: "/images/hero/magazine/magazine3.png",
    h1: "Ils ont pleuré en le recevant.",
    subtitle:
      "Memoriz transforme vos souvenirs en créations personnalisées qui déclenchent de vraies émotions.",
    cta: "Créer le mien",
    ctaIcon: "💫",
    ctaHref: "/albums",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 700);
    },
    [isTransitioning]
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  const goPrev = useCallback(() => {
    goTo((current - 1 + slides.length) % slides.length);
  }, [current, goTo]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext]);

  return (
    <section id="hero" className="relative w-full h-[85vh] min-h-[550px] max-h-[800px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.h1}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-black/20" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <h1
              key={`h1-${current}`}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 animate-fade-in-up"
            >
              {slides[current].h1}
            </h1>
            <p
              key={`sub-${current}`}
              className="text-lg sm:text-xl text-white/85 leading-relaxed mb-8 animate-fade-in-up"
              style={{ animationDelay: "0.15s" }}
            >
              {slides[current].subtitle}
            </p>
            <Link
              key={`cta-${current}`}
              href={slides[current].ctaHref}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold text-lg rounded-full hover:bg-primary-dark transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: "0.3s" }}
            >
              <span>{slides[current].ctaIcon}</span>
              <span>{slides[current].cta}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goPrev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
        aria-label="Précédent"
      >
        <ChevronLeft size={24} />
      </button>
      <button
        onClick={goNext}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/15 backdrop-blur-sm text-white hover:bg-white/30 transition-all"
        aria-label="Suivant"
      >
        <ChevronRight size={24} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goTo(index)}
            className={`rounded-full transition-all duration-300 ${
              index === current
                ? "w-8 h-3 bg-white"
                : "w-3 h-3 bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
