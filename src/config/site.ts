export const siteConfig = {
  name: "ArtForge Studio",
  description:
    "Custom UV-printed metal plates and phone cases. Upload your design, preview in 3D, and order with cash on delivery across Morocco.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  currency: "MAD",
  country: "Morocco",
  locale: "fr-MA",
  navigation: [
    { label: "Accueil", href: "/" },
    { label: "Boutique", href: "/shop" },
    { label: "Personnaliser", href: "/customize" },
    { label: "Services", href: "/services" },
    { label: "Exemples", href: "/examples" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    tagline: "Impression UV sur mesure — Fabriqué au Maroc 🇲🇦",
    links: [
      { label: "À propos", href: "/about" },
      { label: "Nos Services", href: "/services" },
      { label: "FAQ", href: "/faq" },
      { label: "Politique de livraison", href: "/shipping" },
      { label: "Conditions générales", href: "/terms" },
    ],
    social: {
      instagram: "https://instagram.com/artforgestudio",
      facebook: "https://facebook.com/artforgestudio",
      whatsapp: "https://wa.me/212600000000",
    },
  },
};
