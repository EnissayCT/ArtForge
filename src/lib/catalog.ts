import artworksData from "@/data/artworks.json";

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
  source: string;
  license: string;
  featured?: boolean;
}

export interface Collection {
  slug: string;
  name: string;
  kicker: string;
  description: string;
}

export const COLLECTIONS: Collection[] = [
  {
    slug: "japon",
    name: "Estampes japonaises",
    kicker: "Ukiyo-e",
    description:
      "Vagues, montagnes et pluies d'été : les maîtres de l'estampe d'Edo, en aplats francs qui ont été pensés pour l'impression.",
  },
  {
    slug: "zellige",
    name: "Zellige",
    kicker: "Création ArtForge",
    description:
      "Notre série maison : les tracés des fontaines de Fès et des riads de Marrakech, redessinés pièce par pièce. Chaque carreau garde sa nuance, comme un zellige taillé à la main.",
  },
  {
    slug: "espace",
    name: "Espace",
    kicker: "Ciel profond",
    description:
      "Nébuleuses et galaxies captées par Hubble et James Webb. Sur métal brillant, les étoiles prennent un éclat presque réel.",
  },
  {
    slug: "maitres",
    name: "Grands maîtres",
    kicker: "Peinture",
    description: "Van Gogh, Monet, Klimt, Vermeer : les toiles que l'on reconnaît d'un regard, en version métal.",
  },
  {
    slug: "abstrait",
    name: "Abstrait",
    kicker: "Formes & couleurs",
    description: "Kandinsky, Klee, Malevitch, Mondrian. Des compositions qui structurent un mur à elles seules.",
  },
  {
    slug: "affiches",
    name: "Affiches vintage",
    kicker: "Belle Époque",
    description: "Mucha, Toulouse-Lautrec, Chéret : l'âge d'or de l'affiche lithographiée, couleurs ravivées.",
  },
  {
    slug: "orient",
    name: "Maroc & Orient",
    kicker: "Carnets de voyage",
    description: "Tanger, Meknès, l'Atlas : le Maroc vu par les peintres voyageurs du XIXe siècle.",
  },
  {
    slug: "botanique",
    name: "Botanique",
    kicker: "Planches",
    description: "Planches naturalistes de Redouté, Haeckel et Merian. Précision scientifique, élégance de cabinet.",
  },
  {
    slug: "animaux",
    name: "Faune",
    kicker: "Bestiaire",
    description: "Oiseaux d'Audubon, lièvre de Dürer, carpes et grues japonaises.",
  },
];

export const ARTWORKS = (artworksData as Artwork[]).filter((a) =>
  COLLECTIONS.some((c) => c.slug === a.collection),
);

export function getArtwork(slug: string) {
  return ARTWORKS.find((a) => a.slug === slug);
}

export function getCollection(slug: string) {
  return COLLECTIONS.find((c) => c.slug === slug);
}

export function byCollection(slug: string) {
  return ARTWORKS.filter((a) => a.collection === slug);
}

export function isLandscape(a: Pick<Artwork, "w" | "h">) {
  return a.w > a.h * 1.05;
}

export function featured(limit = 8) {
  const list = ARTWORKS.filter((a) => a.featured);
  const rest = ARTWORKS.filter((a) => !a.featured);
  return [...list, ...rest].slice(0, limit);
}

/** Round-robin across collections so lists never feel like one theme repeated. */
export function mixed(limit = 12, offset = 0) {
  const lists = COLLECTIONS.map((c) => byCollection(c.slug));
  const out: Artwork[] = [];
  let i = 0;
  while (out.length < ARTWORKS.length && i < 50) {
    for (const l of lists) if (l[i]) out.push(l[i]);
    i++;
  }
  return out.slice(offset, offset + limit);
}

export function related(a: Artwork, limit = 4) {
  const same = byCollection(a.collection).filter((x) => x.slug !== a.slug);
  const other = mixed(40).filter((x) => x.collection !== a.collection);
  return [...same, ...other].slice(0, limit);
}

export function collectionCover(slug: string) {
  const list = byCollection(slug);
  return list.find((a) => a.featured) ?? list[0];
}

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function search(query: string) {
  const q = normalize(query.trim());
  if (!q) return [];
  const words = q.split(/\s+/);
  return ARTWORKS.filter((a) => {
    const hay = normalize(
      [a.title, a.artist, a.year, getCollection(a.collection)?.name ?? "", ...a.tags].join(" "),
    );
    return words.every((w) => hay.includes(w));
  });
}
