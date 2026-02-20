import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Newspaper, Crown, Baby, Dumbbell, ArrowRight, Star, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Magazines Personnalisés — Memoriz",
  description:
    "Créez des magazines personnalisés avec vous en couverture. Transformez vos moments en publications dignes des plus beaux magazines.",
};

const magazineTypes = [
  {
    icon: Crown,
    title: '"Moi en couverture"',
    description:
      "Anniversaire, réussite, parcours de vie — mettez-vous (ou un proche) en couverture d'un vrai magazine. L'effet wahou garanti.",
    color: "bg-purple-50 text-purple-600",
    iconColor: "text-purple-500",
  },
  {
    icon: Baby,
    title: '"Mon année"',
    description:
      "Retracez une année entière en images et en mots. Parfait pour les bébés, les enfants, ou toute la famille.",
    color: "bg-teal-50 text-teal-600",
    iconColor: "text-teal-500",
  },
  {
    icon: Dumbbell,
    title: '"Ma transformation"',
    description:
      "Fitness, parcours personnel, avant/après — documentez votre évolution dans un format impactant et motivant.",
    color: "bg-orange-50 text-orange-600",
    iconColor: "text-orange-500",
  },
];

const magazineImages = [
  "/images/magazine/WhatsApp Image 2026-02-18 at 19.45.57.jpeg",
  "/images/magazine/WhatsApp Image 2026-02-18 at 19.46.08.jpeg",
  "/images/magazine/WhatsApp Image 2026-02-18 at 19.46.18.jpeg",
  "/images/magazine/WhatsApp Image 2026-02-18 at 19.46.36.jpeg",
  "/images/magazine/WhatsApp Image 2026-02-18 at 19.46.53.jpeg",
  "/images/magazine/WhatsApp Image 2026-02-18 at 19.47.13.jpeg",
  "/images/magazine/WhatsApp Image 2026-02-18 at 19.47.33.jpeg",
  "/images/magazine/WhatsApp Image 2026-02-18 at 19.47.43.jpeg",
];

export default function MagazinesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-violet-50 to-white overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-100/40 rounded-full -translate-y-1/2 -translate-x-1/2 blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-violet-100 text-violet-700 text-sm font-semibold rounded-full mb-6">
                📖 Format exclusif
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
                Magazines <span className="text-primary">personnalisés</span>
              </h1>
              <p className="text-lg text-medium-gray leading-relaxed mb-8">
                Imaginez : vous, en couverture d&apos;un magazine. Ou votre mère pour ses 60 ans.
                Vos vacances transformées en reportage photo digne d&apos;un média premium.
                C&apos;est exactement ce que Memoriz vous propose.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#types"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
                >
                  Créer mon magazine
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="#galerie"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all border border-gray-200"
                >
                  Voir les exemples
                </Link>
              </div>
            </div>

            {/* Magazine preview */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-80 aspect-[3/4] rounded-xl overflow-hidden shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/images/hero/magazine/magazine3.png"
                  alt="Magazine personnalisé exemple"
                  fill
                  className="object-cover"
                  sizes="400px"
                  priority
                />
              </div>
              <div className="absolute -bottom-4 -left-4 w-60 aspect-[3/4] rounded-xl overflow-hidden shadow-xl transform -rotate-6 -z-10">
                <Image
                  src="/images/hero/magazine/magazine0.jpeg"
                  alt="Magazine exemple"
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              </div>
              <div className="absolute -top-4 -right-4 w-48 aspect-[3/4] rounded-xl overflow-hidden shadow-lg transform rotate-6 -z-10">
                <Image
                  src="/images/hero/magazine/magazine1.jpeg"
                  alt="Magazine exemple"
                  fill
                  className="object-cover"
                  sizes="250px"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why magazine */}
      <section className="py-20 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="/images/hero/magazine/magazine2.jpg"
                alt="Magazine ouvert"
                fill
                className="object-cover"
                sizes="600px"
              />
            </div>
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-6">
                Pourquoi un magazine ?
              </h2>
              <p className="text-medium-gray leading-relaxed mb-8">
                Le format magazine est encore très peu exploité dans le monde des souvenirs personnalisés.
                C&apos;est pourtant le plus différenciant : le simple fait d&apos;être en couverture d&apos;un magazine
                déclenche un effet &quot;wahou&quot; immédiat et un fort désir d&apos;achat.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Sparkles size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">Rendu professionnel</h3>
                    <p className="text-sm text-medium-gray">Layout et mise en page dignes d&apos;un vrai magazine</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Star size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">100% personnalisable</h3>
                    <p className="text-sm text-medium-gray">Couverture, articles, photos — tout est à vous</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Newspaper size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-dark">Cadeau ultra original</h3>
                    <p className="text-sm text-medium-gray">Surprenez avec un format inattendu et mémorable</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Magazine Types */}
      <section id="types" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Quel magazine allez-vous créer ?
            </h2>
            <p className="text-lg text-medium-gray max-w-2xl mx-auto">
              Choisissez parmi nos concepts exclusifs ou laissez-vous inspirer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {magazineTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className={`inline-flex p-3 rounded-xl ${type.color} mb-6`}>
                  <type.icon size={24} className={type.iconColor} />
                </div>
                <h3 className="text-xl font-bold text-dark mb-3">{type.title}</h3>
                <p className="text-medium-gray text-sm leading-relaxed">
                  {type.description}
                </p>
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
              Galerie de magazines
            </h2>
            <p className="text-lg text-medium-gray">
              Feuilletez nos créations les plus inspirantes
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {magazineImages.map((image, index) => (
              <div
                key={index}
                className={`relative rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${
                  index === 0 || index === 7 ? "md:col-span-2 md:row-span-2" : ""
                }`}
              >
                <div className={`relative ${index === 0 || index === 7 ? "aspect-square" : "aspect-[3/4]"}`}>
                  <Image
                    src={image}
                    alt={`Magazine exemple ${index + 1}`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Nos formules magazines
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-dark mb-2">Découverte</h3>
              <p className="text-3xl font-bold text-dark mb-1">24 €</p>
              <p className="text-sm text-medium-gray mb-6">16 pages, couverture souple</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Jusqu&apos;à 20 photos
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 2 templates
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Couverture personnalisée
                </li>
              </ul>
              <Link
                href="#"
                className="block text-center py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-full hover:bg-gray-200 transition-colors"
              >
                Choisir
              </Link>
            </div>

            <div className="bg-primary rounded-2xl p-8 shadow-lg relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-accent text-white text-xs font-bold rounded-full">
                Populaire
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Magazine Pro</h3>
              <p className="text-3xl font-bold text-white mb-1">39 €</p>
              <p className="text-sm text-white/70 mb-6">32 pages, papier glacé</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Jusqu&apos;à 50 photos
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Tous les templates
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Design magazine réel
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Papier glacé premium
                </li>
              </ul>
              <Link
                href="#"
                className="block text-center py-3 px-6 bg-white text-primary font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Choisir
              </Link>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-dark mb-2">Édition Luxe</h3>
              <p className="text-3xl font-bold text-dark mb-1">49 €</p>
              <p className="text-sm text-medium-gray mb-6">48 pages, finition premium</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Photos illimitées
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Templates exclusifs
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Finition vernis sélectif
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Coffret cadeau
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
            Votre magazine vous attend
          </h2>
          <p className="text-lg text-medium-gray mb-8">
            Créez un magazine unique en quelques minutes. L&apos;émotion est incluse.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold text-lg rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
          >
            📖 Créer mon magazine
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
