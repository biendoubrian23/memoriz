"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

/* ── Album sub-links ─────────────────────────────────── */
const albumLinks = {
  populaires: [
    { label: "Album Photo Famille", badge: "Populaire" },
    { label: "Album Photo Mariage" },
    { label: "Album Photo Bébé" },
    { label: "Album Photo Voyage" },
    { label: "Album Photo Couple" },
    { label: "Mini Album Photo" },
  ],
  occasions: [
    { label: "Album Photo Anniversaire" },
    { label: "Album Photo Grossesse" },
    { label: "Album Photo Road Trip" },
    { label: "Album Photo Hommage" },
    { label: "Album Photo Scrapbooking" },
    { label: "Album Photo sur Mesure", badge: "Nouveau" },
  ],
  image: "/images/section2/famille.jpeg",
  imageLabel: "Album Photo Famille",
};

/* ── Magazine sub-links ──────────────────────────────── */
const magazineLinks = {
  populaires: [
    { label: "Magazine Couple & Amour", badge: "Populaire" },
    { label: "Magazine Anniversaire" },
    { label: "Magazine Voyage" },
    { label: "Magazine Famille" },
    { label: "Magazine Portrait" },
  ],
  inspirations: [
    { label: "Magazine inspiré Netflix", badge: "Tendance" },
    { label: "Magazine Road Trip" },
    { label: "Magazine Soirée & Fun" },
    { label: "Magazine Objectifs & Rêves" },
    { label: "Magazine sur Mesure", badge: "Nouveau" },
  ],
  image: "/images/section2/love.jpeg",
  imageLabel: "Magazine Couple & Amour",
};

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<"albums" | "magazines" | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleEnter = useCallback((menu: "albums" | "magazines") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpenDropdown(menu);
  }, []);

  const handleLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => setOpenDropdown(null), 200);
  }, []);

  /* Mobile accordion */
  const [mobileAccordion, setMobileAccordion] = useState<string | null>(null);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image
              src="/images/logo (2).png"
              alt="Memoriz"
              width={237}
              height={68}
              className="h-13 sm:h-17 w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Albums */}
            <div
              className="relative"
              onMouseEnter={() => handleEnter("albums")}
              onMouseLeave={handleLeave}
            >
              <Link
                href="/albums"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  openDropdown === "albums"
                    ? "text-primary bg-primary/5"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50"
                }`}
              >
                Albums
              </Link>
            </div>

            {/* Magazines */}
            <div
              className="relative"
              onMouseEnter={() => handleEnter("magazines")}
              onMouseLeave={handleLeave}
            >
              <Link
                href="/magazines"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  openDropdown === "magazines"
                    ? "text-primary bg-primary/5"
                    : "text-gray-700 hover:text-primary hover:bg-gray-50"
                }`}
              >
                Magazines
              </Link>
            </div>

            {/* Contact */}
            <Link
              href="/contact"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary rounded-lg hover:bg-gray-50 transition-all duration-200"
            >
              Contact
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/connexion"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-primary transition-colors"
            >
              Connexion
            </Link>
            <Link
              href="/#hero"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Créer mon souvenir
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* ── Mega Dropdown (Desktop) ──────────────────────── */}
      {openDropdown && (
        <div
          className="hidden lg:block absolute left-0 right-0 bg-white border-t border-gray-100 shadow-xl animate-fade-in"
          onMouseEnter={() => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
          }}
          onMouseLeave={handleLeave}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {openDropdown === "albums" ? (
              <div className="grid grid-cols-[1fr_1fr_280px] gap-10">
                {/* Col 1 */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Les plus populaires
                  </h4>
                  <ul className="space-y-2.5">
                    {albumLinks.populaires.map((item) => (
                      <li key={item.label}>
                        <Link
                          href="/albums"
                          className="group flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="group-hover:underline">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.badge === "Populaire"
                                ? "bg-primary/10 text-primary"
                                : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 2 */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Pour chaque occasion
                  </h4>
                  <ul className="space-y-2.5">
                    {albumLinks.occasions.map((item) => (
                      <li key={item.label}>
                        <Link
                          href="/albums"
                          className="group flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="group-hover:underline">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.badge === "Nouveau"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-primary/10 text-primary"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden bg-soft-gray">
                  <Image
                    src={albumLinks.image}
                    alt={albumLinks.imageLabel}
                    width={280}
                    height={200}
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                  <p className="mt-3 text-sm font-semibold text-dark text-center hero-font-heading">
                    {albumLinks.imageLabel}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[1fr_1fr_280px] gap-10">
                {/* Col 1 */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Les plus populaires
                  </h4>
                  <ul className="space-y-2.5">
                    {magazineLinks.populaires.map((item) => (
                      <li key={item.label}>
                        <Link
                          href="/magazines"
                          className="group flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="group-hover:underline">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.badge === "Populaire"
                                ? "bg-primary/10 text-primary"
                                : item.badge === "Tendance"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-emerald-50 text-emerald-600"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Col 2 */}
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                    Inspirations & styles
                  </h4>
                  <ul className="space-y-2.5">
                    {magazineLinks.inspirations.map((item) => (
                      <li key={item.label}>
                        <Link
                          href="/magazines"
                          className="group flex items-center gap-2 text-sm text-gray-700 hover:text-primary transition-colors"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="group-hover:underline">{item.label}</span>
                          {item.badge && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.badge === "Nouveau"
                                ? "bg-emerald-50 text-emerald-600"
                                : item.badge === "Tendance"
                                  ? "bg-amber-50 text-amber-600"
                                  : "bg-primary/10 text-primary"
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Image */}
                <div className="relative rounded-2xl overflow-hidden bg-soft-gray">
                  <Image
                    src={magazineLinks.image}
                    alt={magazineLinks.imageLabel}
                    width={280}
                    height={200}
                    className="w-full h-48 object-cover rounded-2xl"
                  />
                  <p className="mt-3 text-sm font-semibold text-dark text-center hero-font-heading">
                    {magazineLinks.imageLabel}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom CTA bar */}
            <div className="mt-6 pt-5 border-t border-gray-100 flex justify-center">
              <Link
                href={openDropdown === "albums" ? "/albums" : "/magazines"}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
                onClick={() => setOpenDropdown(null)}
              >
                Voir tous nos {openDropdown === "albums" ? "Albums Photo" : "Magazines"}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Menu ──────────────────────────────────── */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in">
          <div className="px-4 py-6 space-y-1">
            {/* Albums accordion */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileAccordion(mobileAccordion === "albums" ? null : "albums")}
              >
                Albums
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === "albums" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {mobileAccordion === "albums" && (
                <div className="pl-6 pr-4 pb-2 space-y-1">
                  {[...albumLinks.populaires, ...albumLinks.occasions].map((item) => (
                    <Link
                      key={item.label}
                      href="/albums"
                      className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Magazines accordion */}
            <div>
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setMobileAccordion(mobileAccordion === "magazines" ? null : "magazines")}
              >
                Magazines
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${mobileAccordion === "magazines" ? "rotate-180" : ""}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
              {mobileAccordion === "magazines" && (
                <div className="pl-6 pr-4 pb-2 space-y-1">
                  {[...magazineLinks.populaires, ...magazineLinks.inspirations].map((item) => (
                    <Link
                      key={item.label}
                      href="/magazines"
                      className="block py-2 text-sm text-gray-600 hover:text-primary transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Contact */}
            <Link
              href="/contact"
              className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-4 mt-4 border-t border-gray-100 space-y-3">
              <Link
                href="/connexion"
                className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-primary rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/#hero"
                className="block text-center px-6 py-3 text-base font-semibold text-white bg-primary rounded-full hover:bg-primary-dark transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Créer mon souvenir
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
