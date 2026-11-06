import type { MetadataRoute } from "next";
import { getCatalog } from "@/lib/data";
import { SITE } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { artworks: ARTWORKS, collections: COLLECTIONS } = await getCatalog();
  const base = SITE.url.replace(/\/$/, "");
  const pages = ["", "/boutique", "/collections", "/coques", "/creer", "/atelier", "/aide"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p ? 0.8 : 1 })),
    ...COLLECTIONS.map((c) => ({ url: `${base}/collections/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...ARTWORKS.map((a) => ({ url: `${base}/oeuvre/${a.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
