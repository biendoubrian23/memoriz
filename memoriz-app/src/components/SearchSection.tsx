"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const categories = [
  {
    title: "Célébrer mes moments",
    image: "/images/hero/album/album1.jpeg",
    href: "/albums",
    color: "from-pink-500/30 to-transparent",
  },
  {
    title: "Retracer mon année",
    image: "/images/hero/magazine/magazine1.jpeg",
    href: "/magazines",
    color: "from-emerald-500/30 to-transparent",
  },
  {
    title: "Imprimer mon voyage",
    image: "/images/hero/album/album2.jpeg",
    href: "/albums",
    color: "from-blue-500/30 to-transparent",
  },
  {
    title: "Trouver le cadeau parfait",
    image: "/images/hero/magazine/magazine0.jpeg",
    href: "/albums",
    color: "from-amber-500/30 to-transparent",
  },
  {
    title: "Faire plaisir à petit prix",
    image: "/images/hero/magazine/magazine4.jpg",
    href: "/mots-croises",
    color: "from-violet-500/30 to-transparent",
  },
  {
    title: "Les anniversaires",
    image: "/images/hero/album/album3.jpeg",
    href: "/albums",
    color: "from-rose-500/30 to-transparent",
  },
  {
    title: "Les mariages",
    image: "/images/hero/magazine/magazine2.jpg",
    href: "/albums",
    color: "from-cyan-500/30 to-transparent",
  },
];

export default function SearchSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 320;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-2">
            Je cherche à :
          </h2>
          <p className="text-medium-gray text-lg">
            Trouvez l&apos;inspiration pour votre prochain projet
          </p>
        </div>

        {/* Scrollable cards */}
        <div className="relative">
          <button
            onClick={() => scroll("left")}
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hidden sm:flex items-center justify-center"
            aria-label="Précédent"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white shadow-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all hidden sm:flex items-center justify-center"
            aria-label="Suivant"
          >
            <ChevronRight size={20} />
          </button>

          <div
            ref={scrollRef}
            className="scroll-container flex gap-5 overflow-x-auto pb-4 px-1"
          >
            {categories.map((cat, index) => (
              <Link
                key={index}
                href={cat.href}
                className="group flex-shrink-0 w-[220px] sm:w-[260px]"
              >
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="260px"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color}`} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <h3 className="text-white font-semibold text-base leading-tight">
                      {cat.title}
                    </h3>
                    <div className="flex items-center gap-1 mt-2 text-white/80 text-sm group-hover:text-white transition-colors">
                      <span>Découvrir</span>
                      <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
