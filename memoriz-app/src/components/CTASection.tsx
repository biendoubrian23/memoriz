import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-indigo-900 p-12 sm:p-16 lg:p-20">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/5 rounded-full" />

          <div className="relative z-10 text-center max-w-3xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Prêt à créer un souvenir inoubliable ?
            </h2>
            <p className="text-lg sm:text-xl text-white/80 mb-10 leading-relaxed">
              Rejoignez des milliers de créateurs qui transforment leurs moments de vie en créations émotionnelles.
              C&apos;est simple, guidé et le résultat est garanti.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/albums"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary font-semibold text-lg rounded-full hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>Commencer gratuitement</span>
                <ArrowRight size={20} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold text-lg rounded-full hover:bg-white/20 transition-all duration-300 border border-white/20"
              >
                <span>Nous contacter</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
