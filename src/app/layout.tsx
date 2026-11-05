import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { QuickView3D } from "@/components/viewer/QuickView3D";
import { SITE } from "@/lib/site";

const archivo = Archivo({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-archivo",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "ArtForge — Affiches en métal imprimées au Maroc",
    template: "%s — ArtForge",
  },
  description: SITE.description,
  openGraph: {
    title: "ArtForge — Affiches en métal imprimées au Maroc",
    description: SITE.description,
    locale: "fr_MA",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#131211",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <QuickView3D />
      </body>
    </html>
  );
}
