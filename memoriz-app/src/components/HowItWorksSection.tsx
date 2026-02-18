import { Sparkles, Palette, Brain, Heart } from "lucide-react";

const steps = [
  {
    icon: Sparkles,
    step: "01",
    title: "Choisissez votre produit",
    description: "Album, magazine ou mots croisés — sélectionnez le format qui vous parle.",
  },
  {
    icon: Palette,
    step: "02",
    title: "Sélectionnez un template",
    description: "Des designs émotionnels et guidés, pensés pour chaque occasion.",
  },
  {
    icon: Brain,
    step: "03",
    title: "Laissez-vous guider",
    description: "Ajoutez vos photos et textes. Memoriz s'occupe de la mise en page.",
  },
  {
    icon: Heart,
    step: "04",
    title: "Recevez et offrez",
    description: "Votre création est imprimée avec soin et livrée chez vous. L'émotion est garantie.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-4">
            Comment ça marche
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-dark mb-4">
            Créer un souvenir en 4 étapes
          </h2>
          <p className="text-lg text-medium-gray max-w-2xl mx-auto">
            Pas besoin de compétences créatives. Memoriz vous guide du début à la fin.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group text-center p-8 rounded-2xl bg-soft-gray hover:bg-white hover:shadow-lg transition-all duration-300"
            >
              {/* Step number */}
              <div className="absolute top-4 right-4 text-5xl font-black text-gray-100 group-hover:text-primary/10 transition-colors">
                {step.step}
              </div>

              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-6 group-hover:bg-primary/20 transition-colors">
                <step.icon size={28} className="text-primary" />
              </div>

              <h3 className="text-lg font-bold text-dark mb-3">{step.title}</h3>
              <p className="text-sm text-medium-gray leading-relaxed">
                {step.description}
              </p>

              {/* Connector line for desktop */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-gray-200" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
