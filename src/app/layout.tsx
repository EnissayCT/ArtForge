import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";
import { getCatalogData, getPublicSettings } from "@/lib/data";
import { publicCatalog } from "@/lib/catalog";
import { ShopProvider } from "@/components/providers/ShopProvider";

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

export async function generateMetadata(): Promise<Metadata> {
  const { brand } = await getPublicSettings();
  const title = `${brand.name} — ${brand.tagline}`;
  return {
    metadataBase: new URL(SITE.url),
    title: { default: title, template: `%s — ${brand.name}` },
    description: SITE.description,
    applicationName: brand.name,
    openGraph: { title, description: SITE.description, locale: "fr_MA", type: "website", siteName: brand.name },
  };
}

export const viewport: Viewport = {
  themeColor: "#131211",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [settings, catalog] = await Promise.all([getPublicSettings(), getCatalogData()]);
  return (
    <html lang="fr" className={`${archivo.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col">
        <ShopProvider settings={settings} catalog={publicCatalog(catalog)}>
          {children}
        </ShopProvider>
      </body>
    </html>
  );
}
