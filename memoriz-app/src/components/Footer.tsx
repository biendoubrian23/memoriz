import Link from "next/link";
import Image from "next/image";
import { Heart, Mail, MapPin } from "lucide-react";

const footerLinks = {
  produits: [
    { href: "/albums", label: "Albums photo" },
    { href: "/magazines", label: "Magazines personnalisés" },
  ],
  entreprise: [
    { href: "/contact", label: "Contact" },
    { href: "#", label: "À propos" },
    { href: "#", label: "Blog" },
  ],
  legal: [
    { href: "#", label: "Mentions légales" },
    { href: "#", label: "CGV" },
    { href: "#", label: "Politique de confidentialité" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src="/images/logo.png"
                alt="Memoriz"
                width={140}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Transformez vos souvenirs en créations émotionnelles personnalisées.
              Albums, magazines et jeux conçus avec amour.
            </p>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Heart size={14} className="text-accent" />
              <span>Fait avec passion en France</span>
            </div>
          </div>

          {/* Produits */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Nos produits
            </h3>
            <ul className="space-y-3">
              {footerLinks.produits.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Entreprise */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Entreprise
            </h3>
            <ul className="space-y-3">
              {footerLinks.entreprise.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
              Informations
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} Memoriz. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/contact" className="text-gray-500 hover:text-white text-sm transition-colors">
              <Mail size={18} />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
