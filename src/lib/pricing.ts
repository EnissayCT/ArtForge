/**
 * ArtForge — product & pricing configuration.
 * All prices are in Moroccan dirhams (DH / MAD). Edit this file to change the offer.
 */

export type SizeId = "S" | "M" | "L" | "XL";
export type FinishId = "mat" | "brillant" | "brosse";
export type FrameId = "aucun" | "chene" | "noir";
export type CaseTypeId = "slim" | "antichoc";

export interface PlateSize {
  id: SizeId;
  label: string;
  /** portrait dimensions in cm (the artwork is turned for landscape pieces) */
  w: number;
  h: number;
  price: number;
  framePrice: number;
  note?: string;
}

export const SIZES: PlateSize[] = [
  { id: "S", label: "S", w: 20, h: 30, price: 190, framePrice: 90 },
  { id: "M", label: "M", w: 30, h: 40, price: 250, framePrice: 120, note: "Le plus choisi" },
  { id: "L", label: "L", w: 40, h: 60, price: 390, framePrice: 160 },
  { id: "XL", label: "XL", w: 60, h: 90, price: 690, framePrice: 240, note: "Pièce maîtresse" },
];

export const DEFAULT_SIZE: SizeId = "M";

export interface Finish {
  id: FinishId;
  label: string;
  short: string;
  description: string;
  extra: number;
}

export const FINISHES: Finish[] = [
  {
    id: "mat",
    label: "Mat",
    short: "Profond, sans reflet",
    description: "Couleurs denses et velours, aucun reflet même face à une fenêtre.",
    extra: 0,
  },
  {
    id: "brillant",
    label: "Brillant",
    short: "Éclat et contraste",
    description: "Vernis UV glacé : noirs plus profonds, couleurs qui claquent à la lumière.",
    extra: 0,
  },
  {
    id: "brosse",
    label: "Métal brossé",
    short: "Le métal transparaît",
    description: "Les zones claires laissent apparaître l'aluminium brossé. Effet changeant selon la lumière.",
    extra: 40,
  },
];

export interface Frame {
  id: FrameId;
  label: string;
  color: string;
}

export const FRAMES: Frame[] = [
  { id: "aucun", label: "Sans cadre", color: "transparent" },
  { id: "chene", label: "Chêne naturel", color: "#b88a5a" },
  { id: "noir", label: "Noir mat", color: "#1b1a19" },
];

export interface CaseType {
  id: CaseTypeId;
  label: string;
  description: string;
  price: number;
}

export const CASE_TYPES: CaseType[] = [
  { id: "slim", label: "Slim", description: "Coque rigide fine, impression bord à bord.", price: 149 },
  {
    id: "antichoc",
    label: "Antichoc",
    description: "Double couche, coins renforcés, chutes jusqu'à 2 m.",
    price: 189,
  },
];

/** Discount on metal plates when the cart holds several. */
export const BUNDLE = { minPlates: 3, percent: 15 };

/** Promo codes (percent off the items, after the bundle discount). */
export const PROMOS: Record<string, number> = {
  FORGE10: 10,
};

export const SHIPPING = {
  price: 35,
  freeAbove: 500,
  /** business days */
  casablanca: [1, 2] as [number, number],
  others: [2, 4] as [number, number],
};

export function getSize(id: SizeId) {
  return SIZES.find((s) => s.id === id) ?? SIZES[1];
}
export function getFinish(id: FinishId) {
  return FINISHES.find((f) => f.id === id) ?? FINISHES[0];
}
export function getFrame(id: FrameId) {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}
export function getCaseType(id: CaseTypeId) {
  return CASE_TYPES.find((c) => c.id === id) ?? CASE_TYPES[0];
}

export function platePrice(size: SizeId, finish: FinishId, frame: FrameId) {
  const s = getSize(size);
  return s.price + getFinish(finish).extra + (frame === "aucun" ? 0 : s.framePrice);
}

export function casePrice(type: CaseTypeId) {
  return getCaseType(type).price;
}

export const MIN_PRICE = Math.min(SIZES[0].price, CASE_TYPES[0].price);

export function formatDH(value: number) {
  return `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(Math.round(value))} DH`;
}

/** Orientation-aware dimensions (landscape artworks hang sideways). */
export function plateDims(size: SizeId, landscape: boolean) {
  const s = getSize(size);
  return landscape ? { w: s.h, h: s.w } : { w: s.w, h: s.h };
}

/** Delivery window, skipping Sundays. */
export function deliveryWindow(fromDate = new Date(), range: [number, number] = SHIPPING.others) {
  const add = (n: number) => {
    const d = new Date(fromDate);
    let added = 0;
    // orders after 16h ship the next day
    if (d.getHours() >= 16) n += 1;
    while (added < n) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) added++;
    }
    return d;
  };
  const fmt = new Intl.DateTimeFormat("fr-FR", { weekday: "short", day: "numeric", month: "short" });
  return { from: fmt.format(add(range[0] + 1)), to: fmt.format(add(range[1] + 1)) };
}
