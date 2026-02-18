"use client";

import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sophie M.",
    product: "Album Notre Histoire",
    text: "Mon mari a pleuré en ouvrant l'album. C'est le plus beau cadeau que j'ai pu lui offrir. La mise en page est magnifique.",
    rating: 5,
    avatar: "S",
  },
  {
    name: "Thomas D.",
    product: "Magazine Personnalisé",
    text: "Ma mère en couverture d'un magazine pour ses 60 ans ! Elle n'en revenait pas. Rendu professionnel incroyable.",
    rating: 5,
    avatar: "T",
  },
  {
    name: "Camille R.",
    product: "Mots Croisés Famille",
    text: "Offert à mes grands-parents pour Noël. Ils ont adoré retrouver nos souvenirs à travers les mots croisés. Concept génial !",
    rating: 5,
    avatar: "C",
  },
  {
    name: "Julien P.",
    product: "Album Hommage",
    text: "J'ai créé un album en mémoire de mon père. C'était facile malgré l'émotion. Memoriz comprend vraiment ce que ça signifie.",
    rating: 5,
    avatar: "J",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="py-20 sm:py-28 bg-soft-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-warm/20 text-amber-700 text-sm font-semibold rounded-full mb-4">
            Témoignages
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Ils ont créé, ils ont ému.
          </h2>
          <p className="text-lg text-medium-gray max-w-2xl mx-auto">
            Des milliers de souvenirs sublimés. Voici ce qu&apos;en disent nos créateurs.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 leading-relaxed mb-6 text-base italic">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-dark text-sm">
                    {testimonial.name}
                  </p>
                  <p className="text-medium-gray text-xs">{testimonial.product}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
