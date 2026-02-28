"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth/AuthContext";

const slides = [
  {
    image: "/images/hero/1.png",
    h1: "Vos souvenirs méritent mieux qu'un écran.",
    subtitle:
      "Créez des souvenirs personnalisés, beaux et émouvants. Guidé pas à pas, sans compétences créatives requises.",
    cta: "Créer mon souvenir",
    ctaHref: "/creer",
  },
  {
    image: "/images/hero/2.png",
    h1: "Créez vos albums en quelques clics.",
    subtitle:
      "Il existe des milliers de templates. Uploadez simplement vos photos et commandez vos créations personnalisées selon vos goûts.",
    cta: "Découvrir les templates",
    ctaHref: "/creer",
  },
  {
    image: "/images/hero/3.png",
    h1: "Offrez plus qu'un cadeau. Offrez une émotion.",
    subtitle:
      "Albums, magazines et livres personnalisés, créés à partir de votre histoire, avec un design premium.",
    cta: "Créer un cadeau inoubliable",
    ctaHref: "/creer",
  },
  {
    image: "/images/hero/4.png",
    h1: "Un livre qui raconte votre histoire.",
    subtitle:
      "Des pages remplies de souvenirs, de mots et d'émotions. Un cadeau unique qui traverse le temps.",
    cta: "Créer mon livre",
    ctaHref: "/creer",
  },
];

export default function HeroSection() {
  const { user } = useAuth();
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

  // Auto-advance every 9 seconds
  useEffect(() => {
    const timer = setInterval(goNext, 9000);
    return () => clearInterval(timer);
  }, [goNext]);

  return (
    <>
      <div className="w-full px-4 sm:px-[5%] md:px-[10%] lg:px-[15%] mt-16 sm:mt-20">
        <section
          id="hero"
          className="relative pt-14 pb-14 sm:pt-20 sm:pb-20 lg:pb-24 overflow-hidden rounded-b-[32px] md:rounded-b-[48px] rounded-t-none shadow-sm bg-gray-50"
        >
          {/* Background Images Layer */}
          <div className="absolute inset-0 z-0">
            {slides.map((s, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === safeIndex ? "opacity-100" : "opacity-0"
                  }`}
              >
                <Image
                  src={s.image}
                  alt={s.h1}
                  fill
                  className="object-cover object-left md:object-center"
                  priority={index === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                />
              </div>
            ))}
          </div>

          {/* Overlay for mobile readability (gradient on the left) */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-r from-black/20 via-transparent to-transparent md:hidden" />

          {/* Content Layer */}
          <div className="relative z-10 px-6 sm:px-10 lg:px-12">
            <div className="max-w-lg lg:max-w-xl flex flex-col justify-center min-h-[320px] sm:min-h-[360px] lg:min-h-[400px]">
              {/* H1 */}
              <h1
                key={`h1-${safeIndex}`}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.2rem] font-black text-white leading-[1.12] tracking-tight animate-fade-in-up hero-font-heading"
              >
                {slide.h1}
              </h1>

              {/* Subtitle */}
              <p
                key={`sub-${safeIndex}`}
                className="mt-4 sm:mt-6 text-base sm:text-lg text-white/95 leading-relaxed animate-fade-in-up hero-font-body hero-delay-1"
              >
                {slide.subtitle}
              </p>

              {/* CTA buttons */}
              <div
                key={`cta-${safeIndex}`}
                className="mt-8 flex flex-wrap items-center gap-4 animate-fade-in-up hero-delay-2"
              >
                <Link
                  href={user ? "/mes-projets" : slide.ctaHref}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-bold text-sm uppercase tracking-wider rounded-full hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-[1.03] hero-font-body"
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
                    className={`rounded-full transition-all duration-300 ${index === safeIndex
                      ? "w-10 h-2 bg-white"
                      : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
                      }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Spacer or Horizontal separator if needed to separate from the next section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <hr className="border-t border-gray-200" />
      </div>
    </>
  );
}
