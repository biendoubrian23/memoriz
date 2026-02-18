import Image from "next/image";
import Link from "next/link";
import { BookOpen, Newspaper, Puzzle } from "lucide-react";

const products = [
  {
    icon: BookOpen,
    title: "Albums photo émotionnels",
    description:
      "Racontez votre histoire en images. Albums pour couples, familles, hommages — des créations qui font naître de vraies émotions.",
    image: "/images/hero/album/album1.jpeg",
    href: "/albums",
    badge: "Produit phare",
    price: "À partir de 29 €",
    features: ["Design premium", "Création guidée", "Couverture rigide disponible"],
  },
  {
    icon: Newspaper,
    title: "Magazines personnalisés",
    description:
      "Vous en couverture d'un magazine. Mettez en valeur vos moments, vos transformations, votre année — avec un rendu digne des pros.",
    image: "/images/hero/magazine/magazine3.png",
    href: "/magazines",
    badge: "Très différenciant",
    price: "À partir de 24 €",
    features: ["Format magazine réel", "Templates élégants", "Personnalisation totale"],
  },
  {
    icon: Puzzle,
    title: "Mots croisés personnalisés",
    description:
      "Un concept unique : des livres de mots croisés générés à partir de votre histoire personnelle. Le cadeau le plus original.",
    image: "/images/hero/magazine/magazine4.jpg",
    href: "/mots-croises",
    badge: "Innovation",
    price: "À partir de 19 €",
    features: ["Générés automatiquement", "Thèmes personnalisés", "Photos + jeu + émotion"],
  },
];

export default function ProductsSection() {
  return (
    <section className="py-20 sm:py-28 bg-soft-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
            Nos créations
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Trois façons de sublimer vos souvenirs
          </h2>
          <p className="text-lg text-medium-gray max-w-2xl mx-auto">
            Chaque produit Memoriz est pensé pour déclencher des émotions. Pas besoin de compétences créatives — on vous guide.
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <Link
              key={index}
              href={product.href}
              className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
            >
              {/* Image */}
              <div className="relative h-64 overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute top-4 left-4">
                  <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold text-primary rounded-full">
                    {product.badge}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 sm:p-8">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <product.icon size={20} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-dark">{product.title}</h3>
                </div>
                <p className="text-medium-gray text-sm leading-relaxed mb-5">
                  {product.description}
                </p>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {product.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                      <span className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-primary">
                    {product.price}
                  </span>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-primary transition-colors flex items-center gap-1">
                    Découvrir →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
