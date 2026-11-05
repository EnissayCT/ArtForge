export const SITE = {
  name: "ArtForge",
  tagline: "L'art imprimé sur métal",
  description:
    "Affiches en métal imprimées UV au Maroc. Fixation aimantée sans perçage, coques de téléphone, créations personnalisées. Paiement à la livraison partout au Maroc.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  /** WhatsApp number for order confirmations, international format without "+" */
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP || "212600000000",
  email: "bonjour@artforge.ma",
  instagram: "https://instagram.com/artforge.ma",
  city: "Casablanca",
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
