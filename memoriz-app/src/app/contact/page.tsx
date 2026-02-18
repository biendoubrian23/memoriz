import type { Metadata } from "next";
import { Mail, MessageSquare, Clock, MapPin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact — Memoriz",
  description: "Contactez l'équipe Memoriz. Questions, suggestions, partenariats — nous sommes à votre écoute.",
};

export default function ContactPage() {
  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
              Contact
            </span>
            <h1 className="text-4xl sm:text-5xl font-bold text-dark mb-4">
              Parlons de vos souvenirs
            </h1>
            <p className="text-lg text-medium-gray max-w-2xl mx-auto">
              Une question ? Une idée ? Besoin d&apos;aide pour votre création ?
              Notre équipe est là pour vous accompagner.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-dark mb-2">Email</h3>
              <p className="text-medium-gray text-sm">contact@memoriz.fr</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-dark mb-2">Horaires</h3>
              <p className="text-medium-gray text-sm">Lun – Ven, 9h – 18h</p>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 text-center hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <MessageSquare size={24} className="text-primary" />
              </div>
              <h3 className="font-semibold text-dark mb-2">Réponse rapide</h3>
              <p className="text-medium-gray text-sm">Sous 24h en moyenne</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-gray-100">
              <h2 className="text-2xl font-bold text-dark mb-8">Envoyez-nous un message</h2>
              <form className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-dark mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                      placeholder="Votre prénom"
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-dark mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm"
                      placeholder="Votre nom"
                    />
                  </div>
                </div>
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
                  <label htmlFor="subject" className="block text-sm font-medium text-dark mb-2">
                    Sujet
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm text-gray-700"
                  >
                    <option value="">Choisir un sujet</option>
                    <option value="question">Question générale</option>
                    <option value="album">À propos des albums</option>
                    <option value="magazine">À propos des magazines</option>
                    <option value="crossword">À propos des mots croisés</option>
                    <option value="order">Suivi de commande</option>
                    <option value="partnership">Partenariat</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-dark mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-sm resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-4 bg-primary text-white font-semibold rounded-full hover:bg-primary-dark transition-all shadow-md hover:shadow-lg text-base"
                >
                  Envoyer le message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ mini */}
      <section className="py-20 bg-soft-gray">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-dark text-center mb-12">
            Questions fréquentes
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Combien de temps prend la livraison ?",
                a: "En moyenne 5 à 7 jours ouvrés après validation de votre création.",
              },
              {
                q: "Puis-je modifier ma création après commande ?",
                a: "Vous pouvez modifier votre création tant qu'elle n'est pas partie en production. Contactez-nous rapidement !",
              },
              {
                q: "Quel est le délai de réponse du support ?",
                a: "Nous répondons en moyenne sous 24h, du lundi au vendredi.",
              },
              {
                q: "Proposez-vous des livraisons à l'international ?",
                a: "Oui, nous livrons dans toute l'Europe. Les frais et délais varient selon la destination.",
              },
            ].map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
              >
                <h3 className="font-semibold text-dark mb-2">{faq.q}</h3>
                <p className="text-sm text-medium-gray leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
