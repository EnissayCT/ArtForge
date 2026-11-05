import type { Metadata } from "next";
import { Accordion } from "@/components/ui/Accordion";
import { BUNDLE, CASE_TYPES, FINISHES, SHIPPING, SIZES, formatDH } from "@/lib/pricing";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Aide — livraison, paiement, retours, fixation",
  description: "Toutes les réponses sur la livraison au Maroc, le paiement à la livraison, les retours, les tailles et la fixation aimantée ArtForge.",
};

const SECTIONS: { id: string; title: string; items: [string, React.ReactNode][] }[] = [
  {
    id: "livraison",
    title: "Livraison & paiement",
    items: [
      [
        "Combien coûte la livraison ?",
        <>
          {formatDH(SHIPPING.price)} partout au Maroc, offerte dès {formatDH(SHIPPING.freeAbove)} d&apos;achat.
        </>,
      ],
      [
        "En combien de temps je reçois ma commande ?",
        <>
          Nous imprimons sous 48 h ouvrées. Ensuite comptez 24 à 48 h pour Casablanca, Rabat, Salé, Témara et Mohammédia, 48 à
          72 h pour les autres villes.
        </>,
      ],
      [
        "Comment je paie ?",
        <>
          En espèces, directement au livreur, quand vous recevez le colis. Rien n&apos;est à payer en ligne. Nous confirmons
          chaque commande par téléphone ou WhatsApp avant de l&apos;imprimer.
        </>,
      ],
      [
        "Comment est emballée la plaque ?",
        <>Entre deux plaques de carton rigide, coins protégés, sous film. Le métal ne craint ni les chocs légers ni l&apos;humidité.</>,
      ],
    ],
  },
  {
    id: "retours",
    title: "Retours & échanges",
    items: [
      [
        "Ma plaque est arrivée abîmée.",
        <>Envoyez-nous une photo sur WhatsApp dans les 48 h : nous la réimprimons et la renvoyons gratuitement.</>,
      ],
      [
        "Je peux retourner une œuvre du catalogue ?",
        <>
          Oui, sous 14 jours après réception, si elle est dans son emballage d&apos;origine. Les frais de retour sont à votre
          charge, le remboursement se fait par virement ou en bon d&apos;achat.
        </>,
      ],
      [
        "Et les créations personnalisées ?",
        <>
          Elles sont imprimées pour vous seul, elles ne sont donc ni reprises ni échangées, sauf défaut d&apos;impression de
          notre part.
        </>,
      ],
    ],
  },
  {
    id: "fixation",
    title: "Fixation aimantée",
    items: [
      [
        "Comment ça tient au mur ?",
        <>
          Chaque plaque est livrée avec un aimant adhésif. Vous le collez au mur, puis vous approchez la plaque : elle se
          place toute seule. Pas de perceuse, pas de clou.
        </>,
      ],
      [
        "Sur quels murs ça marche ?",
        <>Peinture, béton lisse, carrelage, bois, verre. Évitez le crépi très granuleux et le papier peint fragile.</>,
      ],
      [
        "Je peux l'enlever sans abîmer le mur ?",
        <>Oui : tirez lentement la languette de l&apos;adhésif vers le bas, parallèlement au mur. Il part sans trace.</>,
      ],
    ],
  },
  {
    id: "tailles",
    title: "Tailles & finitions",
    items: [
      [
        "Quelles tailles proposez-vous ?",
        <ul key="sizes" className="space-y-1">
          {SIZES.map((s) => (
            <li key={s.id}>
              <strong>{s.label}</strong> — {s.w} × {s.h} cm — {formatDH(s.price)}
            </li>
          ))}
        </ul>,
      ],
      [
        "Quelle taille choisir ?",
        <>
          Au-dessus d&apos;un canapé, visez environ deux tiers de sa largeur : un L ou un XL seul, ou trois M côte à côte
          (−{BUNDLE.percent} % dès {BUNDLE.minPlates} plaques). Sur un bureau ou une étagère, le S est parfait. Dans
          l&apos;onglet « Chez vous » de chaque œuvre, vous voyez la taille réelle dans une pièce, ou sur une photo de
          votre mur.
        </>,
      ],
      [
        "Mat, brillant ou brossé ?",
        <ul key="finishes" className="space-y-1">
          {FINISHES.map((f) => (
            <li key={f.id}>
              <strong>{f.label}</strong> — {f.description}
            </li>
          ))}
        </ul>,
      ],
      [
        "Et les coques ?",
        <ul key="cases" className="space-y-1">
          {CASE_TYPES.map((c) => (
            <li key={c.id}>
              <strong>{c.label}</strong> ({formatDH(c.price)}) — {c.description}
            </li>
          ))}
        </ul>,
      ],
    ],
  },
  {
    id: "creations",
    title: "Créations personnalisées",
    items: [
      [
        "Quelle image donne le meilleur résultat ?",
        <>
          Une photo nette et bien exposée, la plus grande possible. L&apos;atelier en ligne affiche une jauge de qualité :
          visez « Bonne » ou « Excellente ». Pour un 30 × 40 cm, 1800 × 2400 pixels est un bon minimum.
        </>,
      ],
      [
        "Je peux imprimer n'importe quelle image ?",
        <>
          Vos propres photos, dessins et logos, oui. Vous devez détenir les droits de l&apos;image : nous refusons les
          contenus protégés (marques, personnages sous licence) et les contenus choquants.
        </>,
      ],
    ],
  },
  {
    id: "cgv",
    title: "Conditions & confidentialité",
    items: [
      [
        "Conditions générales de vente",
        <>
          Les prix sont en dirhams TTC. Une commande est ferme après confirmation téléphonique. ArtForge se réserve le droit
          d&apos;annuler une commande injoignable après trois tentatives.
        </>,
      ],
      [
        "Vos données",
        <>
          Nous utilisons votre nom, téléphone et adresse uniquement pour livrer votre commande, et votre e-mail pour la
          lettre du club si vous l&apos;avez demandée. Rien n&apos;est revendu. Pour supprimer vos données : {SITE.email}.
        </>,
      ],
    ],
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-10 sm:px-8">
      <p className="label text-stone">Aide</p>
      <h1 className="display mt-3 text-[60px] sm:text-[110px]">Questions fréquentes</h1>
      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <nav className="lg:col-span-3">
          <ul className="space-y-2 lg:sticky lg:top-24">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="link-u text-[15px]">
                  {s.title}
                </a>
              </li>
            ))}
            <li className="pt-6">
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noreferrer" className="label link-u text-ember-deep">
                Une autre question ? WhatsApp →
              </a>
            </li>
          </ul>
        </nav>
        <div className="space-y-14 lg:col-span-8 lg:col-start-5">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-28">
              <h2 className="display-semi mb-3 text-[30px]">{s.title}</h2>
              <div className="border-t border-ink/12">
                {s.items.map(([q, a], i) => (
                  <Accordion key={q} title={q} defaultOpen={i === 0}>
                    {a}
                  </Accordion>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
