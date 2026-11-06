/**
 * Static site constants. Brand name, contact details and prices are live
 * settings edited in /admin (see lib/pricing.ts and lib/data.ts).
 */
export const SITE = {
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  description:
    "Affiches en métal imprimées UV au Maroc. Fixation aimantée sans perçage, coques de téléphone, créations personnalisées. Paiement à la livraison partout au Maroc.",
};

export const NAV = [
  { label: "Boutique", href: "/boutique" },
  { label: "Collections", href: "/collections" },
  { label: "Coques", href: "/coques" },
  { label: "Créer la vôtre", href: "/creer" },
  { label: "L'atelier", href: "/atelier" },
];

export const CITIES = [
  "Casablanca",
  "Rabat",
  "Marrakech",
  "Fès",
  "Tanger",
  "Agadir",
  "Meknès",
  "Oujda",
  "Kénitra",
  "Tétouan",
  "Salé",
  "Témara",
  "Mohammédia",
  "El Jadida",
  "Safi",
  "Béni Mellal",
  "Nador",
  "Khouribga",
  "Settat",
  "Berrechid",
  "Larache",
  "Essaouira",
  "Ouarzazate",
  "Errachidia",
  "Taza",
  "Khémisset",
  "Al Hoceïma",
  "Ifrane",
  "Guelmim",
  "Laâyoune",
  "Dakhla",
  "Autre ville",
];

export const FAST_CITIES = ["Casablanca", "Mohammédia", "Rabat", "Salé", "Témara"];

/** wa.me link, optionally with a prefilled message. */
export function waLink(number: string, text?: string) {
  const n = number.replace(/\D/g, "");
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Moroccan number (06…, +212…, 00212…) to international digits for wa.me. */
export function toIntlMA(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("00212")) return d.slice(2);
  if (d.startsWith("212")) return d;
  if (d.startsWith("0")) return `212${d.slice(1)}`;
  return d;
}
