const steps = [
  {
    number: "01",
    title: "Choisissez votre produit",
    description: "Album, magazine ou livre — sélectionnez le format qui vous parle.",
  },
  {
    number: "02",
    title: "Sélectionnez un template",
    description: "Des designs élégants et guidés, pensés pour chaque occasion.",
  },
  {
    number: "03",
    title: "Personnalisez",
    description: "Ajoutez vos photos et textes. Memoriz s'occupe de la mise en page.",
  },
  {
    number: "04",
    title: "Recevez et offrez",
    description: "Imprimé avec soin et livré chez vous. L'émotion est garantie.",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 sm:mb-20">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-dark tracking-tight hero-font-heading">
            Créer un souvenir en 4 étapes
          </h2>
          <p className="mt-4 text-base sm:text-lg text-medium-gray max-w-xl mx-auto hero-font-body">
            Pas besoin de compétences créatives. Memoriz vous guide du début à la fin.
          </p>
        </div>

        {/* Steps — Desktop: horizontal timeline / Mobile: vertical */}
        <div className="relative">

          {/* Horizontal connector line (desktop only) */}
          <div className="hidden lg:block absolute top-8 left-[12.5%] right-[12.5%] h-px bg-gray-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-0">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center px-6">

                {/* Number circle */}
                <div className="relative z-10 w-16 h-16 rounded-full border-2 border-primary/30 bg-white flex items-center justify-center mb-6 transition-all duration-300 hover:border-primary hover:shadow-md">
                  <span className="text-xl font-black text-primary hero-font-heading">
                    {step.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-dark mb-2 hero-font-heading">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-medium-gray leading-relaxed max-w-55 hero-font-body">
                  {step.description}
                </p>

              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
