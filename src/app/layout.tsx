import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "ArtForge Studio — Impression UV sur mesure",
    template: "%s | ArtForge Studio",
  },
  description:
    "Créez vos plaques métal et coques de téléphone personnalisées avec impression UV. Livraison partout au Maroc, paiement à la livraison.",
  keywords: [
    "impression UV",
    "plaque métal personnalisée",
    "coque téléphone personnalisée",
    "print on demand Maroc",
    "ArtForge",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
