import Link from "next/link";
import { Mark } from "@/components/brand/Logo";
import { waLink } from "@/lib/site";
import { getCatalog, getShop } from "@/lib/data";
import { NewsletterForm } from "./NewsletterForm";

const columns = (brand: { name: string; instagram: string; whatsapp: string }) => [
  {
    title: "Boutique",
    links: [
      { label: "Toutes les œuvres", href: "/boutique" },
      { label: "Coques de téléphone", href: "/coques" },
      { label: "Créer la vôtre", href: "/creer" },
      { label: "Favoris", href: "/favoris" },
    ],
  },
  {
    title: "Aide",
    links: [
      { label: "Livraison & paiement", href: "/aide#livraison" },
      { label: "Retours & échanges", href: "/aide#retours" },
      { label: "Fixation aimantée", href: "/aide#fixation" },
      { label: "Guide des tailles", href: "/aide#tailles" },
      { label: "Questions fréquentes", href: "/aide" },
    ],
  },
  {
    title: brand.name,
    links: [
      { label: "L'atelier", href: "/atelier" },
      { label: "Commandes pro & cadeaux", href: "/atelier#pro" },
      { label: "Instagram", href: brand.instagram },
      { label: "WhatsApp", href: waLink(brand.whatsapp) },
    ],
  },
];

export async function Footer() {
  const [{ brand }, catalog] = await Promise.all([getShop(), getCatalog()]);
  const COLUMNS = columns(brand);
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto max-w-[1440px] px-4 pt-20 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label text-paper/50">Le club {brand.name}</p>
            <h2 className="display mt-4 text-[54px] sm:text-[72px]">
              Les nouvelles séries,
              <br />
              <span className="text-ember">avant tout le monde.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-paper/65">
              Une lettre par mois : nouvelles collections, éditions limitées et −10 % sur votre première commande.
            </p>
            <NewsletterForm />
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 lg:col-span-7 lg:pl-10">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <p className="label mb-5 text-paper/45">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="link-u text-[14px] text-paper/80 hover:text-paper">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div>
              <p className="label mb-5 text-paper/45">Collections</p>
              <ul className="space-y-2.5">
                {catalog.collections.slice(0, 6).map((c) => (
                  <li key={c.slug}>
                    <Link href={`/collections/${c.slug}`} className="link-u text-[14px] text-paper/80 hover:text-paper">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-20 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-paper/10 py-6 text-[13px] text-paper/50">
          <span className="label">Paiement à la livraison</span>
          <span className="label">Livraison 24–72 h</span>
          <span className="label">Retours 14 jours</span>
          <span className="label">Imprimé au Maroc</span>
        </div>
      </div>
      <div className="overflow-hidden border-t border-paper/10">
        <div className="mx-auto flex max-w-[1440px] items-end justify-between gap-6 px-4 pb-6 pt-10 sm:px-8">
          <div className="flex items-end gap-4 sm:gap-6">
            <Mark className="h-[64px] w-auto text-paper sm:h-[118px]" />
            <span className="display text-[clamp(52px,17vw,76px)] leading-[0.76] sm:text-[160px] lg:text-[210px]">{brand.name}</span>
          </div>
          <div className="hidden pb-2 text-right text-[12px] text-paper/40 md:block">
            <p>© {new Date().getFullYear()} {brand.name} — {brand.city}, Maroc</p>
            <p className="mt-1">
              <Link href="/aide#cgv" className="hover:text-paper">CGV</Link> ·{" "}
              <Link href="/aide#confidentialite" className="hover:text-paper">Confidentialité</Link> ·{" "}
              <Link href="/atelier#credits" className="hover:text-paper">Crédits</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
