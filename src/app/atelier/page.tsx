import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ARTWORKS, mixed } from "@/lib/catalog";
import { VIDEOS, video } from "@/lib/media";
import { SITE } from "@/lib/site";
import { VideoLoop } from "@/components/ui/VideoLoop";

export const metadata: Metadata = {
  title: "L'atelier",
  description: "Comment ArtForge imprime vos affiches en métal au Maroc : impression UV, contrôle à la main, fixation aimantée.",
};

const STEPS = [
  ["Préparation", "Chaque œuvre est recadrée et étalonnée pour le métal : les noirs sont densifiés, les blancs gardés lumineux."],
  ["Impression UV", "Les encres sont projetées puis durcies instantanément par lumière ultraviolette. Elles font corps avec la plaque."],
  ["Contrôle", "Nous inspectons chaque plaque sous lumière rasante : la moindre poussière ou trace et elle est réimprimée."],
  ["Expédition", "Emballée entre deux cartons rigides avec son aimant et sa notice, puis remise au livreur."],
];

export default function AtelierPage() {
  const hero = video("craft");
  const pieces = mixed(6, 30);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        {hero && (
          <div className="absolute inset-0 -z-10 opacity-60">
            <VideoLoop video={hero} />
          </div>
        )}
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/50 to-ink/40" />
        <div className="mx-auto max-w-[1440px] px-4 pb-20 pt-40 sm:px-8 sm:pt-56">
          <p className="label text-paper/60">L&apos;atelier · {SITE.city}</p>
          <h1 className="display mt-4 text-[72px] sm:text-[150px]">
            Fait ici,
            <br />
            <span className="text-ember">fait pour durer.</span>
          </h1>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-14 px-4 py-24 sm:px-8 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <p className="label text-stone">Pourquoi le métal</p>
          <h2 className="display mt-3 text-[48px] sm:text-[68px]">Une affiche qui ne gondole jamais.</h2>
        </div>
        <div className="space-y-5 text-[16px] leading-relaxed text-ink/75 lg:col-span-6 lg:col-start-7">
          <p>
            Le papier jaunit, gondole, se corne. Le métal reste plat, net et lumineux des années. Sous l&apos;encre UV, il donne
            aux couleurs une profondeur que l&apos;on n&apos;obtient pas sur papier — et la finition brossée laisse même
            apparaître le métal dans les zones claires.
          </p>
          <p>
            ArtForge est né d&apos;une idée simple : rendre ces affiches accessibles au Maroc, imprimées ici, livrées partout,
            payées à la réception. Notre catalogue réunit des œuvres du domaine public, numérisées en haute définition par
            les plus grands musées et agences — et vos propres images.
          </p>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-paper-2">
        <ol className="mx-auto grid max-w-[1440px] gap-px px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
          {STEPS.map(([t, d], i) => (
            <li key={t} className="py-12 sm:pr-8">
              <p className="display text-[64px] text-ember">0{i + 1}</p>
              <p className="mt-3 text-[18px] font-semibold">{t}</p>
              <p className="mt-2 text-[14px] leading-relaxed text-stone">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {pieces.map((a) => (
            <Link key={a.slug} href={`/oeuvre/${a.slug}`} className="glint plate relative aspect-[3/4] overflow-hidden" style={{ background: a.color }}>
              <Image src={a.image} alt={a.title} fill sizes="16vw" className="object-cover" />
            </Link>
          ))}
        </div>
      </section>

      <section id="pro" className="bg-ink text-paper">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 py-24 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <p className="label text-paper/50">Professionnels & cadeaux</p>
            <h2 className="display mt-3 text-[52px] sm:text-[80px]">Cafés, hôtels, bureaux.</h2>
          </div>
          <div className="lg:col-span-5 lg:col-start-8">
            <p className="text-[16px] leading-relaxed text-paper/70">
              Décoration d&apos;un lieu, plaques à votre logo, cadeaux d&apos;entreprise ou séries numérotées : nous imprimons
              à partir de 10 pièces avec un tarif dégressif et un bon à tirer avant production.
            </p>
            <a
              href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent("Bonjour ArtForge, je souhaite un devis pour une commande professionnelle.")}`}
              target="_blank"
              rel="noreferrer"
              className="group mt-8 inline-flex items-center gap-4 bg-paper px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-ember hover:text-white"
            >
              Demander un devis <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      <section id="credits" className="mx-auto max-w-[1440px] scroll-mt-24 px-4 py-20 sm:px-8">
        <p className="label text-stone">Crédits</p>
        <p className="mt-4 max-w-3xl text-[14px] leading-relaxed text-stone">
          Les œuvres du catalogue sont dans le domaine public ou sous licence CC0 (NASA / STScI, Metropolitan Museum of Art,
          National Gallery of Art, Rijksmuseum, Paris Musées, via Wikimedia Commons), à l&apos;exception de la collection
          Zellige, création originale ArtForge. {ARTWORKS.length} œuvres au total ; la source exacte figure sur chaque fiche. Vidéos : {VIDEOS.length}{" "}
          séquences Mixkit (licence libre). Photos d&apos;intérieur : voir le fichier de crédits du projet.
        </p>
      </section>
    </>
  );
}
