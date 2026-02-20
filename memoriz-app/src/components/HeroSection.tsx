"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const slides = [
  {
    image: "/images/hero/livre/il_1140xN.7659974740_ghic.jpg",
    h1: "Vos souvenirs méritent mieux qu'un écran.",
    subtitle:
      "Transformez vos moments de vie en albums, magazines et livres personnalisés, conçus pour être ressentis, pas simplement regardés.",
    cta: "Créer mon souvenir",
    ctaHref: "/albums",
  },
  {
    image: "/images/hero/livre/il_1140xN.7586952593_r4q9.jpg",
    h1: "Offrez plus qu'un cadeau. Offrez une émotion.",
    subtitle:
      "Albums photo, magazines et livres de mots croisés personnalisés, créés à partir de votre histoire, avec un design premium.",
    cta: "Créer un cadeau inoubliable",
    ctaHref: "/albums",
  },
  {
    image: "/images/hero/livre/image1.png",
    h1: "Créez des souvenirs personnalisés, beaux et émouvants.",
    subtitle:
      "Albums photo émotionnels, magazines personnalisés et livres de mots croisés, guidés automatiquement, sans compétences créatives.",
    cta: "Commencer la création",
    ctaHref: "/albums",
  },
  {
    image: "/images/hero/livre/image2.png",
    h1: "Un livre qui raconte votre histoire.",
    subtitle:
      "Des pages remplies de souvenirs, de mots et d'émotions. Un cadeau unique qui traverse le temps.",
    cta: "Créer mon livre",
    ctaHref: "/albums",
  },
  {
    image: "/images/hero/livre/image3.png",
    h1: "Le cadeau parfait n'existe pas. Sauf celui-ci.",
    subtitle:
      "Personnalisé, émouvant et unique. Offrez un souvenir qui fera fondre les cœurs.",
    cta: "Offrir un souvenir unique",
    ctaHref: "/albums",
  },
];

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Safety: clamp current if slides array shrinks after hot-reload
  const safeIndex = current >= slides.length ? 0 : current;
  const slide = slides[safeIndex];

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  const goNext = useCallback(() => {
    goTo((current + 1) % slides.length);
  }, [current, goTo]);

  // Auto-advance every 6 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 6000);
    return () => clearInterval(timer);
  }, [goNext]);

  return (
    <section id="hero" className="pt-24 pb-8 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16 min-h-130">

          {/* ── LEFT : Texte ──────────────────────────────────── */}
          <div className="flex-1 flex flex-col justify-center order-2 lg:order-1">
            {/* H1 */}
            <h1
              key={`h1-${safeIndex}`}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.4rem] font-black text-dark leading-[1.12] tracking-tight animate-fade-in-up hero-font-heading"
            >
              {slide.h1}
            </h1>

            {/* Subtitle */}
            <p
              key={`sub-${safeIndex}`}
              className="mt-6 text-base sm:text-lg text-medium-gray leading-relaxed max-w-xl animate-fade-in-up hero-font-body hero-delay-1"
            >
              {slide.subtitle}
            </p>

            {/* CTA buttons */}
            <div
              key={`cta-${safeIndex}`}
              className="mt-10 flex flex-wrap items-center gap-4 animate-fade-in-up hero-delay-2"
            >
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold text-sm uppercase tracking-wider rounded-full hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.03] hero-font-body"
              >
                {slide.cta}
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
              </Link>
            </div>

            {/* Dots / Slide indicators */}
            <div className="mt-10 flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === safeIndex
                      ? "w-8 h-2.5 bg-primary"
                      : "w-2.5 h-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* ── RIGHT : Blob with image ─────────────────────── */}
          {/* ── RIGHT : Blob with image ─────────────────────── */}
          <div className="flex-1 flex items-center justify-center order-1 lg:order-2 relative min-h-85 sm:min-h-105 lg:min-h-130">

            {/* Decorative: small solid pink circle (top-right) */}
            <div className="absolute -top-2 right-8 sm:-top-3 sm:right-12 w-4 h-4 sm:w-6 sm:h-6 rounded-full bg-accent-light/50" />

            {/* Decorative: dashed pink ring (bottom-left, partially visible) */}
            <svg className="absolute -bottom-12 -left-10 sm:-bottom-16 sm:-left-14 w-44 h-44 sm:w-60 sm:h-60" viewBox="0 0 200 200" fill="none">
              <circle cx="100" cy="100" r="90" stroke="#fab1a0" strokeWidth="1.5" strokeDasharray="8 6" opacity="0.35" />
            </svg>

            {/* Decorative: small pink dot (bottom-right) */}
            <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-8 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-primary/20" />

            {/* ─── Main blob with image ─── */}
            <div className="relative w-80 h-72 sm:w-110 sm:h-96 lg:w-130 lg:h-115">
              {/* SVG clip-path definition */}
              <svg className="absolute" width="0" height="0">
                <defs>
                  <clipPath id="hero-blob-clip" clipPathUnits="objectBoundingBox">
                    <path d="M0.39,0.02 C0.52,-0.01,0.62,0.03,0.70,0.05 C0.74,0.06,0.76,0.04,0.78,0.08 C0.82,0.14,0.76,0.22,0.80,0.28 C0.86,0.36,0.98,0.36,1.00,0.48 C1.02,0.60,0.96,0.72,0.88,0.82 C0.80,0.92,0.68,0.99,0.54,1.00 C0.40,1.01,0.24,0.97,0.14,0.88 C0.04,0.79,-0.01,0.66,0.00,0.52 C0.01,0.38,0.06,0.24,0.14,0.14 C0.22,0.04,0.30,0.04,0.39,0.02Z" />
                  </clipPath>
                </defs>
              </svg>

              {/* Blob shape with image */}
              <div className="absolute inset-0 hero-blob-clip overflow-hidden hero-blob-shadow">
                {slides.map((s, index) => (
                  <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-800 ease-in-out ${
                      index === safeIndex ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    <Image
                      src={s.image}
                      alt={s.h1}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 640px) 320px, (max-width: 1024px) 440px, 520px"
                    />
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Horizontal separator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <hr className="border-t border-gray-200" />
      </div>
    </section>
  );
}
