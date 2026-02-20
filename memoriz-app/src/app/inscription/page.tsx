"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/auth/AuthContext";

export default function InscriptionPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Veuillez renseigner votre prénom et votre nom.");
      return;
    }
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    if (!acceptedTerms) {
      setError("Vous devez accepter les conditions d'utilisation.");
      return;
    }

    setLoading(true);
    try {
      const { error: signUpError } = await signUp(email, password, firstName, lastName);

      if (signUpError) {
        setError(signUpError);
        setLoading(false);
      } else {
        // Check for pending config from creation wizard
        const pendingConfig = localStorage.getItem("memoriz_pending_config");
        if (pendingConfig) {
          router.push("/creer?step=connect-success");
        } else {
          router.push("/");
        }
      }
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  };

  return (
    <div className="pt-20 min-h-screen bg-soft-gray flex items-center justify-center">
      <div className="w-full max-w-md mx-4">
        <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-100">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/images/logo (2).png"
              alt="Memoriz"
              width={160}
              height={45}
              className="h-12 w-auto mx-auto mb-4"
              style={{ width: 'auto', height: 'auto' }}
            />

            <h1 className="text-2xl font-bold text-dark">Créer votre compte</h1>
            <p className="text-sm text-medium-gray mt-1">
              Rejoignez Memoriz et commencez à créer vos souvenirs
            </p>
          </div>
          {/* Google Sign-Up */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 py-3 border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className="text-sm font-medium text-gray-700">S&apos;inscrire avec Google</span>
          </button>

          {/* Séparateur */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase">ou</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom & Prénom */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label htmlFor="prenom" className="block text-sm font-medium text-dark mb-1.5">
                  Prénom
                </label>
                <input
                  type="text"
                  id="prenom"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  placeholder="Jean"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="nom" className="block text-sm font-medium text-dark mb-1.5">
                  Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-1.5">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark mb-1.5">
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="Minimum 8 caractères"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-dark mb-1.5">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                placeholder="Retapez votre mot de passe"
              />
            </div>

            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="terms" className="text-xs text-gray-500 leading-relaxed">
                J&apos;accepte les{" "}
                <Link href="#" className="text-primary hover:underline">
                  conditions d&apos;utilisation
                </Link>{" "}
                et la{" "}
                <Link href="#" className="text-primary hover:underline">
                  politique de confidentialité
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md hover:shadow-lg mt-2 disabled:opacity-50"
            >
              {loading ? "Création en cours..." : "Créer mon compte"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-medium-gray">
              Vous avez déjà un compte ?{" "}
              <Link href="/connexion" className="text-primary font-semibold hover:text-primary-dark transition-colors">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
