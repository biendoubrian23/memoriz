import Image from "next/image";

const features = [
  {
    image: "/images/section3/31.png",
    badge: "Drag & Drop",
    title: "Des templates prêts à l'emploi, il suffit de glisser vos photos",
    description:
      "Choisissez parmi nos dizaines de templates professionnels et glissez-déposez vos photos. Pas besoin de compétences en design — le résultat est garanti dès le premier essai.",
    highlights: ["Templates pro inclus", "Glisser-déposer intuitif", "Résultat immédiat"],
  },
  {
    image: "/images/section3/32.jpg",
    badge: "Sans Canva",
    title: "Oubliez Canva. Ici, tout est déjà pensé pour vous",
    description:
      "Pas d'abonnement, pas de courbe d'apprentissage. Nos mises en page sont designées par des pros. Vous n'ajoutez que vos souvenirs — on s'occupe du reste.",
    highlights: ["Zéro abonnement", "Pas de compétences requises", "Design professionnel"],
  },
  {
    image: "/images/section3/33.png",
    badge: "Personnalisable",
    title: "Ajoutez textes, stickers et emojis pour un rendu unique",
    description:
      "Votre livre, votre style. Personnalisez chaque page avec vos mots, vos stickers favoris et des emojis. Faites de chaque double page une œuvre à votre image.",
    highlights: ["Textes personnalisés", "Stickers & emojis", "100% vous"],
  },
  {
    image: "/images/section3/34.png",
    badge: "Impression directe",
    title: "Créez et imprimez en quelques clics. C'est aussi simple que ça",
    description:
      "Une fois votre création terminée, commandez l'impression en un clic. Recevez chez vous un livre de qualité premium, relié et prêt à offrir.",
    highlights: ["Impression haute qualité", "Livraison à domicile", "Prêt à offrir"],
  },
  {
    image: "/images/section3/35.jpeg",
    badge: "Voyages",
    title: "Vos aventures méritent mieux qu'un album photo classique",
    description:
      "Transformez vos souvenirs de voyage en un véritable livre magazine. Du template au livre imprimé, tout se fait en quelques minutes sans effort.",
    highlights: ["Carnet de voyage premium", "Templates thématiques", "Du digital au papier"],
  },
];

export default function DragDropSection() {
  return (
    <section id="drag-drop" className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-dark tracking-tight hero-font-heading">
            Créez votre livre en quelques minutes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-medium-gray max-w-2xl mx-auto hero-font-body">
            Des templates magnifiques, du drag & drop et une impression directe.
            Pas besoin de Canva ni de talent artistique.
          </p>
        </div>

        {/* Alternating feature rows */}
        <div className="flex flex-col gap-20 lg:gap-28">
          {features.map((feature, index) => {
            const isReversed = index % 2 !== 0;

            return (
              <div
                key={feature.title}
                className={`flex flex-col ${isReversed ? "lg:flex-row-reverse" : "lg:flex-row"} items-center gap-10 lg:gap-16`}
              >
                {/* Image */}
                <div className="w-full lg:w-1/2">
                  <div className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <Image
                      src={feature.image}
                      alt={feature.title}
                      width={640}
                      height={440}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  </div>
                </div>

                {/* Text content */}
                <div className="w-full lg:w-1/2">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-4 hero-font-body">
                    {feature.badge}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-dark leading-snug hero-font-heading">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-base text-medium-gray leading-relaxed hero-font-body">
                    {feature.description}
                  </p>

                  {/* Highlights */}
                  <ul className="mt-6 flex flex-col gap-3">
                    {feature.highlights.map((highlight) => (
                      <li
                        key={highlight}
                        className="flex items-center gap-3 text-sm font-medium text-dark hero-font-body"
                      >
                        <span className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                          <svg
                            className="w-3.5 h-3.5 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </span>
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
