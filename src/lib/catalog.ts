/**
 * Catalog model (pure, works in the browser and on the server).
 * The live catalog is stored in data/catalog.json and edited in /admin/produits;
 * src/data/artworks.json + collections.json are only the initial seed.
 */

export interface Artwork {
  slug: string;
  title: string;
  artist: string;
  year: string;
  collection: string;
  image: string;
  w: number;
  h: number;
  color: string;
  tags: string[];
  source?: string;
  license?: string;
  featured?: boolean;
  /** hidden works stay in the admin but disappear from the shop */
  hidden?: boolean;
  createdAt?: string;
}

export interface Collection {
  slug: string;
  name: string;
  kicker: string;
  description: string;
}

export interface CatalogData {
  artworks: Artwork[];
  collections: Collection[];
}

export function isLandscape(a: Pick<Artwork, "w" | "h">) {
  return a.w > a.h * 1.05;
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Light copy for the browser: drops admin-only fields. */
export function publicCatalog(data: CatalogData): CatalogData {
  return {
    collections: data.collections,
    artworks: data.artworks
      .filter((a) => !a.hidden && data.collections.some((c) => c.slug === a.collection))
      .map(({ slug, title, artist, year, collection, image, w, h, color, tags, featured }) => ({
        slug,
        title,
        artist,
        year,
        collection,
        image,
        w,
        h,
        color,
        tags,
        featured,
      })),
  };
}

export function makeCatalog(data: CatalogData) {
  const collections = data.collections;
  const artworks = data.artworks.filter((a) => !a.hidden && collections.some((c) => c.slug === a.collection));

  const get = (slug: string) => artworks.find((a) => a.slug === slug);
  const collection = (slug: string) => collections.find((c) => c.slug === slug);
  const byCollection = (slug: string) => artworks.filter((a) => a.collection === slug);

  const featured = (limit = 8) => {
    const list = artworks.filter((a) => a.featured);
    const rest = artworks.filter((a) => !a.featured);
    return [...list, ...rest].slice(0, limit);
  };

  /** Round-robin across collections so lists never feel like one theme repeated. */
  const mixed = (limit = 12, offset = 0) => {
    const lists = collections.map((c) => byCollection(c.slug));
    const out: Artwork[] = [];
    const longest = Math.max(0, ...lists.map((l) => l.length));
    for (let i = 0; i < longest; i++) for (const l of lists) if (l[i]) out.push(l[i]);
    return out.slice(offset, offset + limit);
  };

  const related = (a: Artwork, limit = 4) => {
    const same = byCollection(a.collection).filter((x) => x.slug !== a.slug);
    const other = mixed(40).filter((x) => x.collection !== a.collection);
    return [...same, ...other].slice(0, limit);
  };

  const cover = (slug: string) => {
    const list = byCollection(slug);
    return list.find((a) => a.featured) ?? list[0];
  };

  const search = (query: string) => {
    const q = normalize(query.trim());
    if (!q) return [];
    const words = q.split(/\s+/);
    return artworks.filter((a) => {
      const hay = normalize([a.title, a.artist, a.year, collection(a.collection)?.name ?? "", ...a.tags].join(" "));
      return words.every((w) => hay.includes(w));
    });
  };

  return { artworks, collections, get, collection, byCollection, featured, mixed, related, cover, search };
}

export type Catalog = ReturnType<typeof makeCatalog>;
