import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — Memoriz",
  description: "Connectez-vous à votre espace Memoriz pour accéder à vos projets et créations.",
};

export default function ConnexionPage() {
  return (
    <div className="pt-20 min-h-screen bg-soft-gray flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/images/logo.png"
              alt="Memoriz"
              width={120}
              height={35}
              className="h-8 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-dark">Bienvenue</h1>
            <p className="text-sm text-medium-gray mt-1">
              Connectez-vous pour accéder à vos projets
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="votre@email.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="••••••••"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                Se souvenir de moi
              </label>
              <Link href="#" className="text-sm text-primary hover:text-primary-dark transition-colors">
                Mot de passe oublié ?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md hover:shadow-lg"
            >
              Se connecter
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-medium-gray">
              Pas encore de compte ?{" "}
              <Link href="#" className="text-primary font-semibold hover:text-primary-dark transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
