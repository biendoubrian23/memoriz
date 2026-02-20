import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Heart, Users, Camera, Gift, Star, ArrowRight, ChevronRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Albums Photo Personnalisés — Memoriz",
  description:
    "Créez des albums photo émotionnels et personnalisés. Couples, familles, hommages — des souvenirs qui font naître de vraies émotions.",
};

const albumTypes = [
  {
    icon: Heart,
    title: 'Album "Notre Histoire"',
    description:
      "Retracez votre histoire d'amour. De la rencontre aux voyages, en passant par les premiers moments — un album pour deux.",
    occasions: ["Saint-Valentin", "Anniversaires", "Mariages"],
    color: "bg-rose-50 text-rose-600",
    iconColor: "text-rose-500",
  },
  {
    icon: Users,
    title: "Album Famille & Parents",
    description:
      'Offrez un album "Pour maman", "Pour papa" ou un album naissance. Les souvenirs de famille méritent d\'être sublimés.',
    occasions: ["Fête des mères", "Naissance", "Réunion de famille"],
    color: "bg-blue-50 text-blue-600",
    iconColor: "text-blue-500",
  },
  {
    icon: Camera,
    title: "Album Hommage & Souvenir",
    description:
      'Un album "Merci pour tout" ou en mémoire d\'un proche. Puissant émotionnellement, créé avec toute la délicatesse nécessaire.',
    occasions: ["Hommage", "Remerciement", "Mémoire"],
    color: "bg-amber-50 text-amber-700",
    iconColor: "text-amber-500",
  },
];

const albumImages = [
  "/images/album/WhatsApp Image 2026-02-18 at 19.52.03.jpeg",
  "/images/album/WhatsApp Image 2026-02-18 at 19.52.47.jpeg",
  "/images/album/WhatsApp Image 2026-02-18 at 19.53.26.jpeg",
  "/images/album/WhatsApp Image 2026-02-18 at 19.53.37.jpeg",
  "/images/album/WhatsApp Image 2026-02-18 at 19.54.24.jpeg",
  "/images/album/WhatsApp Image 2026-02-18 at 19.54.39.jpeg",
  "/images/album/WhatsApp Image 2026-02-18 at 19.55.03.jpeg",
  "/images/album/WhatsApp Image 2026-02-18 at 19.55.19.jpeg",
];

const features = [
  {
    title: "Design premium",
    description: "Mise en page digne d'un photographe professionnel",
  },
  {
    title: "Création guidée",
    description: "Pas besoin de compétences — on vous accompagne",
  },
  {
    title: "Templates émotionnels",
    description: "Romantique, familial, voyage, hommage, luxe",
  },
  {
    title: "Finitions haut de gamme",
    description: "Couverture rigide, papier photo épais, coffret cadeau",
  },
];

export default function AlbumsPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-rose-50 to-white overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-rose-100/50 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-rose-100 text-rose-700 text-sm font-semibold rounded-full mb-6">
                ❤️ Produit phare
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
                Albums photo <span className="text-primary">émotionnels</span>
              </h1>
              <p className="text-lg text-medium-gray leading-relaxed mb-8">
                Racontez votre histoire en images. Chaque album Memoriz est une création unique
                qui capture l&apos;essence de vos plus beaux moments et les transforme en un objet
                précieux à feuilleter encore et encore.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#types"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
                >
                  Créer mon album
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="#galerie"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all border border-gray-200"
                >
                  Voir les exemples
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark">29 €</p>
                  <p className="text-xs text-medium-gray">À partir de</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark">5★</p>
                  <p className="text-xs text-medium-gray">Note moyenne</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark">2k+</p>
                  <p className="text-xs text-medium-gray">Albums créés</p>
                </div>
              </div>
            </div>

            {/* Image collage */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/hero/album/album1.jpeg"
                      alt="Album photo exemple"
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/hero/album/album3.jpeg"
                      alt="Album photo exemple"
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="relative aspect-square rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/hero/album/album2.jpeg"
                      alt="Album photo exemple"
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-lg">
                    <Image
                      src="/images/album/Beige Playful Birthday Photo Collage.png"
                      alt="Album collage"
                      fill
                      className="object-cover"
                      sizes="300px"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Album Types */}
      <section id="types" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Un album pour chaque histoire
            </h2>
            <p className="text-lg text-medium-gray max-w-2xl mx-auto">
              Choisissez le format qui correspond à votre occasion. Chaque template est pensé pour maximiser l&apos;émotion.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {albumTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${type.color} mb-6`}>
                  <type.icon size={24} className={type.iconColor} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{type.title}</h3>
                <p className="text-medium-gray text-sm leading-relaxed mb-6">
                  {type.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {type.occasions.map((occasion, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-full"
                    >
                      {occasion}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="galerie" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Inspirations & réalisations
            </h2>
            <p className="text-lg text-medium-gray">
              Découvrez quelques-unes de nos plus belles créations
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {albumImages.map((image, index) => (
              <div
                key={index}
                className={`relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  index === 0 || index === 5 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className={`relative ${index === 0 || index === 5 ? "aspect-square" : "aspect-[3/4]"}`}>
                  <Image
                    src={image}
                    alt={`Album exemple ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-6">
                Pourquoi choisir Memoriz pour vos albums ?
              </h2>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1 w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Star size={16} className="text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark mb-1">{feature.title}</h3>
                      <p className="text-sm text-medium-gray">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/album/WhatsApp Image 2026-02-18 at 19.56.08.jpeg"
                  alt="Album qualité premium"
                  fill
                  className="object-cover"
                  sizes="500px"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-6 shadow-xl">
                <p className="text-sm font-semibold text-dark mb-1">À partir de</p>
                <p className="text-3xl font-bold text-primary">29 €</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Nos formules albums
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {/* Essentiel */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-dark mb-2">Essentiel</h3>
              <p className="text-3xl font-bold text-dark mb-1">29 €</p>
              <p className="text-sm text-medium-gray mb-6">Album souple, 24 pages</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Jusqu&apos;à 30 photos
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 3 templates
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Textes personnalisés
                </li>
              </ul>
              <Link
                href="#"
                className="block text-center py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
              >
                Choisir
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-primary rounded-2xl p-8 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">
                Populaire
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Premium</h3>
              <p className="text-3xl font-bold text-white mb-1">49 €</p>
              <p className="text-sm text-white/70 mb-6">Album rigide, 40 pages</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Jusqu&apos;à 80 photos
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Tous les templates
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Couverture rigide
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Papier photo épais
                </li>
              </ul>
              <Link
                href="#"
                className="block text-center py-3 px-6 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Choisir
              </Link>
            </div>

            {/* Luxe */}
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-dark mb-2">Luxe</h3>
              <p className="text-3xl font-bold text-dark mb-1">69 €</p>
              <p className="text-sm text-medium-gray mb-6">Album rigide, 60 pages</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Photos illimitées
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Templates exclusifs
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Dorure & finitions luxe
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Coffret cadeau inclus
                </li>
              </ul>
              <Link
                href="#"
                className="block text-center py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
              >
                Choisir
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
            Prêt à créer votre album ?
          </h2>
          <p className="text-lg text-medium-gray mb-8">
            Commencez maintenant et recevez votre création chez vous en quelques jours.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold text-lg rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
          >
            ❤️ Créer mon album
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
