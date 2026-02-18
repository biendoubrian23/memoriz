import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Memoriz — Vos souvenirs méritent mieux qu'un écran",
  description:
    "Transformez vos moments de vie en albums photo, magazines personnalisés et livres de mots croisés. Créations émotionnelles, design premium, ultra simples à réaliser.",
  keywords: [
    "album photo personnalisé",
    "magazine personnalisé",
    "mots croisés personnalisés",
    "cadeau émotion",
    "souvenir photo",
    "Memoriz",
  ],
  openGraph: {
    title: "Memoriz — Vos souvenirs méritent mieux qu'un écran",
    description:
      "Albums photo émotionnels, magazines personnalisés et livres de mots croisés. Créations guidées, design premium.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white`}
      >
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
