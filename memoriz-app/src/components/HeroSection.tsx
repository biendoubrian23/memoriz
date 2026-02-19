"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

const livreImages = [
  "/images/hero/livre/il_1140xN.7539016394_2wyb.png",
  "/images/hero/livre/il_1140xN.7586952581_5bel.jpg",
  "/images/hero/livre/il_1140xN.7586952583_k1mf.png",
  "/images/hero/livre/il_1140xN.7586952593_r4q9.jpg",
  "/images/hero/livre/il_1140xN.7586952823_ako4.png",
  "/images/hero/livre/il_1140xN.7659974740_ghic.jpg",
];

const slides = [
  {
    h1: "Vos souvenirs méritent mieux qu'un écran.",
    subtitle:
      "Transformez vos moments de vie en albums, magazines et livres personnalisés, conçus pour être ressentis, pas simplement regardés.",
    cta: "Créer mon souvenir",
    ctaIcon: "👉",
    ctaHref: "/albums",
  },
  {
    h1: "Offrez plus qu'un cadeau. Offrez une émotion.",
    subtitle:
      "Albums photo, magazines et livres de mots croisés personnalisés, créés à partir de votre histoire, avec un design premium.",
    cta: "Créer un cadeau inoubliable",
    ctaIcon: "🎁",
    ctaHref: "/albums",
  },
  {
    h1: "Créez des souvenirs personnalisés, beaux et émouvants.",
    subtitle:
      "Albums photo émotionnels, magazines personnalisés et livres de mots croisés, guidés automatiquement, sans compétences créatives.",
    cta: "Commencer la création",
    ctaIcon: "✨",
    ctaHref: "/albums",
  },
  {
    h1: "Vos souvenirs, mis en page comme un magazine.",
    subtitle:
      "Un design élégant, une création guidée, et des produits personnalisés qui racontent votre histoire.",
    cta: "Créer mon livre personnalisé",
    ctaIcon: "📖",
    ctaHref: "/magazines",
  },
  {
    h1: "Chaque souvenir a une histoire. Memoriz la sublime.",
    subtitle:
      "Créez des albums, magazines et jeux personnalisés qui font revivre les moments qui comptent vraiment.",
    cta: "Donner vie à mes souvenirs",
    ctaIcon: "❤️",
    ctaHref: "/albums",
  },
  {
    h1: "Pas juste des photos. Des histoires à feuilleter.",
    subtitle:
      "Albums émotionnels, magazines personnalisés et livres de mots croisés générés à partir de votre histoire.",
    cta: "Découvrir Memoriz",
    ctaIcon: "🚀",
    ctaHref: "/magazines",
  },
];

/* ── SVG Blob clip-path (main shape for images) ── */
function BlobDefs() {
  return (
    <svg width="0" height="0" className="absolute">
      <defs>
        <clipPath id="blobClip" clipPathUnits="objectBoundingBox">
          <path d="M0.44,0.02 C0.58,-0.02,0.78,0.05,0.89,0.17 C1.0,0.29,1.02,0.48,0.97,0.64 C0.92,0.80,0.80,0.92,0.65,0.98 C0.50,1.04,0.32,1.0,0.18,0.91 C0.04,0.82,-0.02,0.66,0.01,0.50 C0.04,0.34,0.14,0.20,0.27,0.10 C0.34,0.05,0.37,0.04,0.44,0.02Z" />
        </clipPath>
      </defs>
    </svg>
  );
}

/* ── Background blob shape (offset layer) ── */
function BackgroundBlob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 500" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M220,10 C280,-5,370,25,420,80 C470,135,490,220,470,300 C450,380,390,440,320,470 C250,500,170,490,105,440 C40,390,-5,310,5,235 C15,160,75,95,140,55 C175,35,195,18,220,10Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ── Small decorative blob ── */
function SmallBlob({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" className={className} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M50,5 C65,0,80,10,90,25 C100,40,98,60,88,75 C78,90,60,98,45,95 C30,92,15,82,8,65 C1,48,5,28,18,15 C28,5,40,8,50,5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/* ── Decorative curved lines ── */
function DecorativeLines({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} xmlns="http://www.w3.org/2000/svg" fill="none">
      <path d="M10,70 Q40,50 30,20" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M20,75 Q50,55 40,25" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M30,80 Q60,60 50,30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function HeroSection() {
  const [current, setCurrent] = useState(0);
  const [textVisible, setTextVisible] = useState(true);
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("left");
  const [imageAnimating, setImageAnimating] = useState(false);
  const prevImage = useRef(0);

  useEffect(() => {
    const timer = setInterval(() => {
      advance((prev) => (prev + 1) % Math.max(slides.length, livreImages.length));
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  function advance(getNext: (prev: number) => number) {
    setTextVisible(false);
    setSlideDirection("left");
    setImageAnimating(true);
    prevImage.current = current;

    setTimeout(() => {
      setCurrent((prev) => getNext(prev));
      setTextVisible(true);
      setTimeout(() => setImageAnimating(false), 600);
    }, 400);
  }

  function goTo(index: number) {
    if (index === current) return;
    setSlideDirection(index > current ? "left" : "right");
    setTextVisible(false);
    setImageAnimating(true);
    prevImage.current = current;

    setTimeout(() => {
      setCurrent(index);
      setTextVisible(true);
      setTimeout(() => setImageAnimating(false), 600);
    }, 400);
  }

  const slide = slides[current % slides.length];
  const imageIndex = current % livreImages.length;

  return (
    <section id="hero" className="pt-24 pb-16 bg-white overflow-hidden">
      <BlobDefs />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16 min-h-125">

          {/* LEFT — Text content */}
          <div
            className={`flex-1 flex flex-col justify-center transition-all duration-500 ease-out ${
              textVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <h1
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-[3.25rem] font-normal italic text-dark leading-tight mb-6"
              style={{ fontFamily: "var(--font-dm-serif), Georgia, serif" }}
            >
              {slide.h1}
            </h1>

            <p
              className="text-base sm:text-lg text-medium-gray leading-relaxed mb-8 max-w-lg"
              style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
            >
              {slide.subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={slide.ctaHref}
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-white font-semibold text-sm uppercase tracking-wider hover:bg-primary-dark transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 rounded-sm"
                style={{ fontFamily: "var(--font-geist-sans), system-ui, sans-serif" }}
              >
                <span>{slide.ctaIcon}</span>
                {slide.cta}
              </Link>
            </div>

            {/* Dots indicator */}
            <div className="flex items-center gap-2 mt-10">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goTo(index)}
                  className={`rounded-full transition-all duration-300 ${
                    index === current % slides.length
                      ? "w-8 h-3 bg-primary"
                      : "w-3 h-3 bg-gray-300 hover:bg-gray-400"
                  }`}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — Blob image area */}
          <div className="flex-1 relative flex items-center justify-center min-h-105 lg:min-h-130">

            {/* Background dark blob (offset behind) */}
            <BackgroundBlob className="absolute w-[95%] h-[95%] text-primary-dark/20 top-[8%] left-[8%] z-0" />

            {/* Main colored blob background */}
            <BackgroundBlob className="absolute w-[92%] h-[92%] text-primary/10 top-[4%] left-[3%] z-0" />

            {/* Main image container with blob clip */}
            <div
              className="relative w-[88%] aspect-square z-10"
              style={{ clipPath: "url(#blobClip)" }}
            >
              {livreImages.map((src, index) => {
                const isActive = index === imageIndex;
                const wasPrev = index === prevImage.current % livreImages.length;

                let transform = "translateX(100%)";
                if (isActive && !imageAnimating) {
                  transform = "translateX(0)";
                } else if (isActive && imageAnimating) {
                  transform = "translateX(0)";
                } else if (wasPrev && imageAnimating) {
                  transform = slideDirection === "left" ? "translateX(-100%)" : "translateX(100%)";
                } else {
                  transform = slideDirection === "left" ? "translateX(100%)" : "translateX(-100%)";
                }

                return (
                  <div
                    key={src}
                    className={`absolute inset-0 ${
                      isActive || (wasPrev && imageAnimating)
                        ? "transition-transform duration-600 ease-in-out"
                        : ""
                    }`}
                    style={{ transform }}
                  >
                    <Image
                      src={src}
                      alt={`Livre personnalisé ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                  </div>
                );
              })}
            </div>

            {/* Decorative small blob — top right */}
            <SmallBlob className="absolute w-10 h-10 sm:w-14 sm:h-14 text-primary/30 top-[2%] right-[12%] z-20 animate-float-slow" />

            {/* Decorative small blob — bottom left */}
            <SmallBlob className="absolute w-8 h-8 sm:w-11 sm:h-11 text-accent/40 bottom-[8%] left-[2%] z-20 animate-float-slow-reverse" />

            {/* Decorative curved lines — bottom right */}
            <DecorativeLines className="absolute w-14 h-14 sm:w-20 sm:h-20 text-primary/25 bottom-[5%] right-[5%] z-20" />
          </div>

        </div>
      </div>

      {/* Horizontal separator */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <hr className="border-t border-gray-200" />
      </div>
    </section>
  );
}
