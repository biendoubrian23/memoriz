import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Puzzle, Heart, Users, Plane, Brain, Gift, ArrowRight, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Mots Croisés Personnalisés — Memoriz",
  description:
    "Livres de mots croisés personnalisés générés à partir de votre histoire. Le cadeau le plus original : photos + jeu + émotion.",
};

const crosswordTypes = [
  {
    icon: Heart,
    title: '"Notre Histoire"',
    description:
      "Des grilles de mots croisés générées à partir de vos souvenirs de couple. Dates, lieux, anecdotes — tout y est.",
  },
  {
    icon: Users,
    title: "Mots Croisés Famille",
    description:
      "Retrouvez l'histoire de votre famille à travers des grilles uniques. Noms, événements, traditions familiales.",
  },
  {
    icon: Plane,
    title: "Mots Croisés Voyage",
    description:
      "Revivre vos voyages autrement. Destinations, expériences, découvertes — transformés en jeu passionnant.",
  },
  {
    icon: Gift,
    title: "Mots Croisés Hommage",
    description:
      "Rendez hommage à un proche de manière originale. Un livre-jeu qui célèbre une vie, une amitié, un lien.",
  },
];

const features = [
  {
    title: "Généré automatiquement",
    description: "Notre algorithme crée des grilles uniques à partir de votre histoire personnelle.",
  },
  {
    title: "Photos + Jeu + Émotion",
    description: "Un mélange inédit qui rend chaque page à la fois ludique et touchante.",
  },
  {
    title: "Thèmes personnalisés",
    description: "Amour, famille, voyage, souvenirs, culture — choisissez vos thèmes.",
  },
  {
    title: "Cadeau parfait",
    description: "Idéal pour les seniors, les couples, les familles — un cadeau qu'on n'oublie pas.",
  },
];

export default function MotsCroisesPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 bg-gradient-to-b from-amber-50 to-white overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-amber-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-violet-100/30 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-1.5 bg-amber-100 text-amber-700 text-sm font-semibold rounded-full mb-6">
                🧩 Innovation Memoriz
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-dark leading-tight mb-6">
                Mots croisés <span className="text-primary">personnalisés</span>
              </h1>
              <p className="text-lg text-medium-gray leading-relaxed mb-8">
                Un concept unique au monde : des livres de mots croisés générés automatiquement
                à partir de votre histoire personnelle. Photos, anecdotes et souvenirs
                transformés en grilles de jeu émotionnelles.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="#types"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
                >
                  Créer mon livre
                  <ArrowRight size={18} />
                </Link>
                <Link
                  href="#comment"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all border border-gray-200"
                >
                  Comment ça marche ?
                </Link>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-gray-100">
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark">19 €</p>
                  <p className="text-xs text-medium-gray">À partir de</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark">100%</p>
                  <p className="text-xs text-medium-gray">Personnalisé</p>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="text-center">
                  <p className="text-2xl font-bold text-dark">∞</p>
                  <p className="text-xs text-medium-gray">Thèmes possibles</p>
                </div>
              </div>
            </div>

            {/* Visual */}
            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-md">
                {/* Crossword grid illustration */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
                  <div className="text-center mb-6">
                    <Puzzle size={48} className="text-primary mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-dark">Votre Livre Personnalisé</h3>
                    <p className="text-sm text-medium-gray">50+ grilles uniques</p>
                  </div>
                  
                  {/* Mini crossword grid */}
                  <div className="grid grid-cols-7 gap-0.5 mb-6 max-w-[220px] mx-auto">
                    {Array.from({ length: 49 }).map((_, i) => {
                      const isBlack = [2, 6, 8, 14, 20, 22, 26, 28, 34, 40, 42, 46].includes(i);
                      const hasLetter = !isBlack && [0, 1, 3, 4, 5, 7, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 21, 23, 24, 25, 27, 29, 30, 31, 32, 33, 35, 36, 37, 38, 39, 41, 43, 44, 45, 47, 48].includes(i);
                      const letters = "MEMORIZ AMOUR FAMILLE VOYAGE SOUVENIR";
                      return (
                        <div
                          key={i}
                          className={`aspect-square flex items-center justify-center text-[10px] font-bold rounded-sm ${
                            isBlack ? "bg-gray-900" : "bg-amber-50 border border-amber-200 text-primary"
                          }`}
                        >
                          {hasLetter ? letters[i % letters.length] : ""}
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-center">
                    <span className="px-4 py-2 bg-primary/10 text-primary text-sm font-semibold rounded-full">
                      📸 Photos + 🧠 Jeu + ❤️ Émotion
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="comment" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Comment vos mots croisés sont créés
            </h2>
            <p className="text-lg text-medium-gray max-w-2xl mx-auto">
              Un processus simple et magique qui transforme votre histoire en jeu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Brain size={28} className="text-primary" />
              </div>
              <div className="text-4xl font-black text-gray-100 mb-4">01</div>
              <h3 className="text-lg font-bold text-dark mb-3">Racontez votre histoire</h3>
              <p className="text-sm text-medium-gray leading-relaxed">
                Ajoutez des noms, dates, lieux, anecdotes. Plus vous partagez, plus les grilles sont personnalisées.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Sparkles size={28} className="text-primary" />
              </div>
              <div className="text-4xl font-black text-gray-100 mb-4">02</div>
              <h3 className="text-lg font-bold text-dark mb-3">La magie opère</h3>
              <p className="text-sm text-medium-gray leading-relaxed">
                Notre algorithme génère des grilles uniques à partir de vos informations. Chaque mot a un sens.
              </p>
            </div>
            <div className="text-center p-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Gift size={28} className="text-primary" />
              </div>
              <div className="text-4xl font-black text-gray-100 mb-4">03</div>
              <h3 className="text-lg font-bold text-dark mb-3">Offrez & jouez</h3>
              <p className="text-sm text-medium-gray leading-relaxed">
                Recevez votre livre imprimé avec des dizaines de grilles personnalisées. Le cadeau parfait.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Types */}
      <section id="types" className="py-20 sm:py-28 bg-soft-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Choisissez votre thème
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {crosswordTypes.map((type, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <type.icon size={22} className="text-primary" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">{type.title}</h3>
                <p className="text-sm text-medium-gray leading-relaxed">
                  {type.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-8">
                Le cadeau le plus original que vous puissiez offrir
              </h2>
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="mt-1 w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Puzzle size={16} className="text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-dark mb-1">{feature.title}</h3>
                      <p className="text-sm text-medium-gray">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-violet-50 rounded-3xl p-12 text-center">
              <Puzzle size={64} className="text-primary mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-dark mb-4">
                Un cadeau unique au monde
              </h3>
              <p className="text-medium-gray mb-8">
                Personne d&apos;autre n&apos;aura le même livre. Chaque page est générée spécialement pour vous.
              </p>
              <div className="flex items-center justify-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-xs text-medium-gray">Grilles par livre</p>
                </div>
                <div className="w-px h-12 bg-gray-200" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">100+</p>
                  <p className="text-xs text-medium-gray">Pages illustrées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 sm:py-28 bg-soft-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
              Nos formules mots croisés
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-dark mb-2">Pocket</h3>
              <p className="text-3xl font-bold text-dark mb-1">19 €</p>
              <p className="text-sm text-medium-gray mb-6">30 grilles, format poche</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 30 grilles personnalisées
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 1 thème au choix
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Solutions incluses
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
                Best-seller
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Classique</h3>
              <p className="text-3xl font-bold text-white mb-1">29 €</p>
              <p className="text-sm text-white/70 mb-6">50 grilles, format A5</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> 50 grilles personnalisées
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Thèmes multiples
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Photos intégrées
                </li>
                <li className="flex items-center gap-2 text-sm text-white/90">
                  <span className="w-1.5 h-1.5 bg-white rounded-full" /> Couverture personnalisée
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
              <h3 className="text-lg font-bold text-dark mb-2">Deluxe</h3>
              <p className="text-3xl font-bold text-dark mb-1">39 €</p>
              <p className="text-sm text-medium-gray mb-6">80 grilles, format A4</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> 80+ grilles personnalisées
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Thèmes illimités
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Photos HD intégrées
                </li>
                <li className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-1.5 h-1.5 bg-primary rounded-full" /> Coffret cadeau premium
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
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-dark mb-4">
            Prêt à créer un cadeau unique ?
          </h2>
          <p className="text-lg text-medium-gray mb-8">
            Des mots croisés qui racontent votre histoire. Le cadeau le plus original.
          </p>
          <Link
            href="#"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-white font-semibold text-lg rounded-full hover:bg-primary-dark transition-all shadow-lg hover:shadow-xl"
          >
            🧩 Créer mon livre de mots croisés
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
}
