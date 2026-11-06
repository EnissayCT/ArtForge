/**
 * Product & pricing model, shared by the storefront, the admin and the order API.
 * The live values are stored in data/settings.json and edited in /admin (Tarifs, Réglages).
 * DEFAULT_SETTINGS below is only the starting point. All prices are in dirhams (DH / MAD).
 */
import { BRANDS, PHONES, type Brand } from "./phones";

export type SizeId = string;
export type FinishId = string;
export type FrameId = string;
export type CaseTypeId = string;

/** How a finish is rendered in previews and in 3D. */
export type FinishLook = "mat" | "brillant" | "brosse";
/** How a case type is rendered in 3D. */
export type CaseStyle = "slim" | "antichoc";

export interface PlateSize {
  id: SizeId;
  label: string;
  /** portrait dimensions in cm (landscape artworks hang sideways) */
  w: number;
  h: number;
  price: number;
  framePrice: number;
  note?: string;
  active: boolean;
}

export interface Finish {
  id: FinishId;
  label: string;
  short: string;
  description: string;
  extra: number;
  look: FinishLook;
  active: boolean;
}

export interface Frame {
  id: FrameId;
  label: string;
  color: string;
  active: boolean;
}

export interface CaseType {
  id: CaseTypeId;
  label: string;
  description: string;
  price: number;
  style: CaseStyle;
  active: boolean;
}

export interface PromoCode {
  code: string;
  percent: number;
  active: boolean;
}

export interface BrandInfo {
  name: string;
  tagline: string;
  email: string;
  instagram: string;
  /** international format without "+", e.g. 212612345678 */
  whatsapp: string;
  city: string;
}

export interface MessageTemplates {
  confirm: string;
  waitlist: string;
  shipped: string;
}

export interface StoreSettings {
  brand: BrandInfo;
  announcements: string[];
  sizes: PlateSize[];
  defaultSize: SizeId;
  finishes: Finish[];
  frames: Frame[];
  caseTypes: CaseType[];
  bundle: { minPlates: number; percent: number };
  shipping: { price: number; freeAbove: number; fast: [number, number]; others: [number, number] };
  phonesDisabled: string[];
  /** Meta (Facebook/Instagram) pixel id, empty to disable */
  pixelId: string;
  /** private: never sent to the browser */
  promos: PromoCode[];
  /** private: WhatsApp message templates used in the admin */
  templates: MessageTemplates;
}

export type PublicSettings = Omit<StoreSettings, "promos" | "templates">;

/** The frame id that means "no frame". It cannot be removed in the admin. */
export const NO_FRAME = "aucun";

export const WHATSAPP_PLACEHOLDER = "212600000000";

export const DEFAULT_SETTINGS: StoreSettings = {
  brand: {
    name: "ArtForge",
    tagline: "Affiches en métal imprimées au Maroc",
    email: "bonjour@artforge.ma",
    instagram: "https://instagram.com/artforge.ma",
    whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || WHATSAPP_PLACEHOLDER,
    city: "Casablanca",
  },
  announcements: [
    "Paiement à la livraison partout au Maroc",
    "Livraison offerte dès 500 DH",
    "−15 % dès 3 plaques",
    "Fixation aimantée : aucun perçage",
  ],
  sizes: [
    { id: "S", label: "S", w: 20, h: 30, price: 190, framePrice: 90, active: true },
    { id: "M", label: "M", w: 30, h: 40, price: 250, framePrice: 120, note: "Le plus choisi", active: true },
    { id: "L", label: "L", w: 40, h: 60, price: 390, framePrice: 160, active: true },
    { id: "XL", label: "XL", w: 60, h: 90, price: 690, framePrice: 240, note: "Pièce maîtresse", active: true },
  ],
  defaultSize: "M",
  finishes: [
    {
      id: "mat",
      label: "Mat",
      short: "Profond, sans reflet",
      description: "Couleurs denses et velours, aucun reflet même face à une fenêtre.",
      extra: 0,
      look: "mat",
      active: true,
    },
    {
      id: "brillant",
      label: "Brillant",
      short: "Éclat et contraste",
      description: "Vernis UV glacé : noirs plus profonds, couleurs qui claquent à la lumière.",
      extra: 0,
      look: "brillant",
      active: true,
    },
    {
      id: "brosse",
      label: "Métal brossé",
      short: "Le métal transparaît",
      description: "Les zones claires laissent apparaître l'aluminium brossé. Effet changeant selon la lumière.",
      extra: 40,
      look: "brosse",
      active: true,
    },
  ],
  frames: [
    { id: NO_FRAME, label: "Sans cadre", color: "transparent", active: true },
    { id: "chene", label: "Chêne naturel", color: "#b88a5a", active: true },
    { id: "noir", label: "Noir mat", color: "#1b1a19", active: true },
  ],
  caseTypes: [
    { id: "slim", label: "Slim", description: "Coque rigide fine, impression bord à bord.", price: 149, style: "slim", active: true },
    {
      id: "antichoc",
      label: "Antichoc",
      description: "Double couche, coins renforcés, chutes jusqu'à 2 m.",
      price: 189,
      style: "antichoc",
      active: true,
    },
  ],
  bundle: { minPlates: 3, percent: 15 },
  shipping: { price: 35, freeAbove: 500, fast: [1, 2], others: [2, 4] },
  phonesDisabled: [],
  pixelId: "",
  promos: [{ code: "FORGE10", percent: 10, active: true }],
  templates: {
    confirm:
      "Bonjour {prenom} 👋\nIci {marque}. Merci pour votre commande {numero} :\n{articles}\n\nTotal à payer à la livraison : {total}.\nPouvez-vous nous confirmer votre adresse à {ville} ? Merci !",
    waitlist:
      "Bonjour {prenom} 👋\nIci {marque}, merci beaucoup pour votre commande {numero} !\n\nNos premières séries de plaques sont en cours de préparation : nous ne pouvons pas encore expédier votre commande. Nous vous écrirons ici dès qu'elle pourra être produite. Rien à payer d'ici là, et vous pouvez annuler à tout moment.\n\nMerci pour votre confiance 🙏",
    shipped:
      "Bonjour {prenom}, votre commande {numero} est en route 🚚\nLe livreur vous appellera avant de passer. Montant à régler à la livraison : {total}.\nMerci d'avoir choisi {marque} !",
  },
};

export function toPublic(s: StoreSettings): PublicSettings {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { promos, templates, ...pub } = s;
  return pub;
}

export function formatDH(value: number) {
  return `${new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(Math.round(value))} DH`;
}

export type PricedItem = { qty: number } & (
  | { kind: "plate"; size: SizeId; finish: FinishId; frame: FrameId }
  | { kind: "case"; caseType: CaseTypeId }
);

/**
 * Everything the storefront needs to price and describe products, built from
 * the (public) settings. Used identically in the browser and on the server, so
 * the order API never has to trust a total computed by the client.
 */
export function makeShop(s: PublicSettings) {
  const sizes = s.sizes.filter((x) => x.active);
  const finishes = s.finishes.filter((x) => x.active);
  const frames = s.frames.filter((x) => x.active || x.id === NO_FRAME);
  const caseTypes = s.caseTypes.filter((x) => x.active);
  const phones = PHONES.filter((p) => !s.phonesDisabled.includes(p.id));
  const brands = BRANDS.filter((b) => phones.some((p) => p.brand === b)) as Brand[];
  const defaultSize = sizes.find((x) => x.id === s.defaultSize)?.id ?? sizes[Math.min(1, sizes.length - 1)]?.id ?? "M";

  const size = (id: SizeId) => sizes.find((x) => x.id === id) ?? s.sizes.find((x) => x.id === id) ?? sizes[0];
  const finish = (id: FinishId) => finishes.find((x) => x.id === id) ?? s.finishes.find((x) => x.id === id) ?? finishes[0];
  const frame = (id: FrameId) => s.frames.find((x) => x.id === id) ?? frames[0];
  const caseType = (id: CaseTypeId) => caseTypes.find((x) => x.id === id) ?? s.caseTypes.find((x) => x.id === id) ?? caseTypes[0];
  const phone = (id: string) => phones.find((p) => p.id === id) ?? PHONES.find((p) => p.id === id) ?? phones[0] ?? PHONES[0];

  const platePrice = (sizeId: SizeId, finishId: FinishId, frameId: FrameId) => {
    const sz = size(sizeId);
    return sz.price + (finish(finishId)?.extra ?? 0) + (frameId === NO_FRAME ? 0 : sz.framePrice);
  };
  const casePrice = (id: CaseTypeId) => caseType(id)?.price ?? 0;
  const unitPrice = (i: PricedItem) => (i.kind === "plate" ? platePrice(i.size, i.finish, i.frame) : casePrice(i.caseType));

  /** Orientation-aware dimensions (landscape artworks hang sideways). */
  const plateDims = (sizeId: SizeId, landscape: boolean) => {
    const sz = size(sizeId);
    return landscape ? { w: sz.h, h: sz.w } : { w: sz.w, h: sz.h };
  };

  /** Shared by the cart UI and the order API. `promoPercent` is resolved on the server. */
  const totals = (items: PricedItem[], promoPercent = 0) => {
    const subtotal = items.reduce((sum, i) => sum + unitPrice(i) * i.qty, 0);
    const plates = items.filter((i) => i.kind === "plate");
    const plateCount = plates.reduce((n, i) => n + i.qty, 0);
    const plateSubtotal = plates.reduce((sum, i) => sum + unitPrice(i) * i.qty, 0);
    const discount =
      s.bundle.percent > 0 && plateCount >= s.bundle.minPlates ? Math.round((plateSubtotal * s.bundle.percent) / 100) : 0;
    const promo = Math.round(((subtotal - discount) * promoPercent) / 100);
    const afterDiscount = subtotal - discount - promo;
    const shipping = items.length === 0 || afterDiscount >= s.shipping.freeAbove ? 0 : s.shipping.price;
    return {
      subtotal,
      discount,
      promo,
      promoPercent,
      plateCount,
      shipping,
      total: afterDiscount + shipping,
      count: items.reduce((n, i) => n + i.qty, 0),
      toFreeShipping: Math.max(0, s.shipping.freeAbove - afterDiscount),
    };
  };

  const prices = [...sizes.map((x) => x.price), ...caseTypes.map((x) => x.price)];
  return {
    brand: s.brand,
    announcements: s.announcements,
    pixelId: s.pixelId,
    sizes,
    finishes,
    frames,
    caseTypes,
    phones,
    brands,
    bundle: s.bundle,
    shipping: s.shipping,
    defaultSize,
    defaultFinish: finishes[0]?.id ?? "mat",
    defaultCaseType: caseTypes[0]?.id ?? "slim",
    defaultPhone: phones.find((p) => p.id === "iphone-16")?.id ?? phones[0]?.id ?? PHONES[0].id,
    /** cheapest plate */
    fromPrice: sizes.length ? Math.min(...sizes.map((x) => x.price)) : 0,
    minPrice: prices.length ? Math.min(...prices) : 0,
    size,
    finish,
    frame,
    caseType,
    phone,
    platePrice,
    casePrice,
    unitPrice,
    plateDims,
    totals,
  };
}

export type Shop = ReturnType<typeof makeShop>;

/** Delivery window, skipping Sundays. */
export function deliveryWindow(fromDate: Date, range: [number, number]) {
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
