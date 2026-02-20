import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Playfair_Display, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import { AuthProvider } from "@/lib/auth/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
  style: ["normal", "italic"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
});

export const metadata: Metadata = {
  title: "Memoriz — Vos souvenirs méritent mieux qu'un écran",
  description:
    "Transformez vos moments de vie en albums photo et magazines personnalisés. Créations émotionnelles, design premium, ultra simples à réaliser.",
  keywords: [
    "album photo personnalisé",
    "magazine personnalisé",
    "cadeau émotion",
    "souvenir photo",
    "Memoriz",
  ],
  openGraph: {
    title: "Memoriz — Vos souvenirs méritent mieux qu'un écran",
    description:
      "Albums photo émotionnels et magazines personnalisés. Créations guidées, design premium.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" data-scroll-behavior="smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${dmSerif.variable} antialiased`}
      >
        <AuthProvider>
          <LayoutShell>{children}</LayoutShell>
        </AuthProvider>
      </body>
    </html>
  );
}
