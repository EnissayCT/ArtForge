import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { ARTWORKS, COLLECTIONS, byCollection, collectionCover, featured, getArtwork, mixed } from "@/lib/catalog";
import { video } from "@/lib/media";
import { CASE_TYPES, SHIPPING, SIZES, formatDH } from "@/lib/pricing";
import { getPhone } from "@/lib/phones";
import { HeroPlates } from "@/components/home/HeroPlates";
import { RoomTeaser } from "@/components/home/RoomTeaser";
import { SizesToScale } from "@/components/home/SizesToScale";
import { ArtCard } from "@/components/product/ArtCard";
import { PhoneMockup } from "@/components/phone/PhoneMockup";
import { VideoLoop } from "@/components/ui/VideoLoop";
import { Reveal } from "@/components/ui/Reveal";

function SectionHead({
  kicker,
  title,
  link,
  tone = "paper",
}: {
  kicker: string;
  title: React.ReactNode;
  link?: { href: string; label: string };
  tone?: "paper" | "ink";
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
      <div>
        <p className={`label ${tone === "ink" ? "text-paper/50" : "text-stone"}`}>{kicker}</p>
        <h2 className="display mt-3 text-[46px] sm:text-[64px] lg:text-[76px]">{title}</h2>
      </div>
      {link && (
        <Link href={link.href} className="label link-u flex items-center gap-1.5 pb-2">
          {link.label} <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  // left · centre · right — the centre piece should be a strong portrait
  const hero = ["la-grande-vague", "les-piliers-de-la-creation", "tournee-du-chat-noir"]
    .map((s) => getArtwork(s))
    .filter((a): a is NonNullable<typeof a> => !!a);
  if (hero.length < 3) hero.push(...featured(8).filter((a) => !hero.includes(a)).slice(0, 3 - hero.length));
  const best = mixed(8);
  const fresh = mixed(8, 8);
  const heroVideo = video("hero");
  const craftVideo = video("craft");
  const lifestyleVideo = video("lifestyle");
  const textureVideo = video("texture");
  const caseArts = mixed(3, 16);
  const sizeArt = byCollection("japon")[0] ?? ARTWORKS[0];

  return (
    <>
      {/* ---------------- Hero ---------------- */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_70%_40%,#2b2723_0%,transparent_70%)]" />
        <div className="relative mx-auto grid min-h-[calc(100svh-100px)] max-w-[1440px] grid-cols-1 items-center gap-6 px-4 py-14 sm:px-8 lg:max-h-[900px] lg:grid-cols-12 lg:py-10">
          <div className="lg:col-span-5">
            <p className="label animate-fade-up text-paper/55">
              {ARTWORKS.length} œuvres · {COLLECTIONS.length} collections · imprimées à Casablanca
            </p>
            <h1 className="display mt-6 animate-fade-up text-[78px] [animation-delay:80ms] sm:text-[118px] xl:text-[138px]">
              L&apos;art,
              <br />
              forgé sur
              <br />
              <span className="text-ember">métal.</span>
            </h1>
            <p className="mt-7 max-w-[440px] animate-fade-up text-[17px] leading-relaxed text-paper/70 [animation-delay:160ms]">
              Des affiches en métal imprimées UV, aux couleurs qui ne passent pas. Elles se fixent par aimant en trente
              secondes, sans un seul trou dans le mur.
            </p>
            <div className="mt-9 flex animate-fade-up flex-wrap gap-3 [animation-delay:240ms]">
              <Link
                href="/boutique"
                className="group flex items-center gap-4 bg-paper px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-ember hover:text-white"
              >
                Explorer la boutique
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/creer"
                className="flex items-center gap-4 border border-paper/30 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors hover:border-paper"
              >
                Imprimer ma photo
              </Link>
            </div>
            <dl className="mt-12 grid max-w-[460px] animate-fade-up grid-cols-3 border-t border-paper/15 pt-5 [animation-delay:320ms]">
              {[
                ["Dès", formatDH(SIZES[0].price)],
                ["Fixation", "Aimant inclus"],
                ["Paiement", "À la livraison"],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="label text-[10px] text-paper/45">{k}</dt>
                  <dd className="mt-1 text-[14px] font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative hidden h-[620px] lg:col-span-7 lg:block">
            <HeroPlates arts={hero} />
          </div>
          <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 sm:scroll-px-8 gap-4 overflow-x-auto px-4 lg:hidden">
            {hero.map((a) => (
              <Link key={a.slug} href={`/oeuvre/${a.slug}`} className="w-[62%] shrink-0 snap-start">
                <div className="glint plate relative aspect-[3/4] overflow-hidden" style={{ background: a.color }}>
                  <Image src={a.image} alt={a.title} fill sizes="60vw" className="object-cover" priority />
                </div>
                <p className="mt-2 text-[12px] text-paper/70">{a.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Promises ---------------- */}
      <section className="border-b border-ink/10">
        <div className="mx-auto grid max-w-[1440px] grid-cols-2 divide-ink/10 px-4 sm:px-8 lg:grid-cols-4 lg:divide-x">
          {[
            ["01", "Paiement à la livraison", "Vous payez en espèces, colis en main."],
            ["02", "Livraison 24–72 h", `Offerte dès ${formatDH(SHIPPING.freeAbove)}, partout au Maroc.`],
            ["03", "Zéro perçage", "Un aimant adhésif suffit, pour tous les murs."],
            ["04", "Réimpression garantie", "Abîmée au transport ? On la refait."],
          ].map(([n, t, d]) => (
            <div key={n} className="py-7 lg:px-8 lg:first:pl-0">
              <p className="label text-ember-deep">{n}</p>
              <p className="mt-2 text-[15px] font-semibold">{t}</p>
              <p className="mt-1 text-[13px] leading-snug text-stone">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------- Collections ---------------- */}
      <section className="mx-auto max-w-[1440px] px-4 pt-24 sm:px-8">
        <SectionHead kicker="Collections" title={<>Trouvez votre<br />univers</>} link={{ href: "/collections", label: "Toutes les collections" }} />
        <div className="no-scrollbar -mx-4 flex snap-x scroll-px-4 sm:scroll-px-8 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-8 sm:px-8">
          {COLLECTIONS.map((c, i) => {
            const cover = collectionCover(c.slug);
            if (!cover) return null;
            return (
              <Reveal key={c.slug} delay={i * 60} className="w-[72%] shrink-0 snap-start sm:w-[42%] lg:w-[23%]">
                <Link href={`/collections/${c.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden" style={{ background: cover.color }}>
                    <Image
                      src={cover.image}
                      alt=""
                      fill
                      sizes="(min-width:1024px) 23vw, 70vw"
                      className="object-cover transition-transform duration-[1.6s] ease-[var(--ease-out-expo)] group-hover:scale-[1.06]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-paper">
                      <p className="label text-paper/60">
                        {c.kicker} · {byCollection(c.slug).length}
                      </p>
                      <p className="display mt-2 text-[38px]">{c.name}</p>
                    </div>
                    <span className="absolute right-4 top-4 grid size-9 place-items-center rounded-full bg-paper/0 text-paper transition-colors group-hover:bg-paper group-hover:text-ink">
                      <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- Best sellers ---------------- */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8">
        <SectionHead kicker="Sélection de l'atelier" title="Les incontournables" link={{ href: "/boutique", label: "Toute la boutique" }} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {best.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 4) * 70}>
              <ArtCard art={a} priority={i < 4} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Magnet mount (video) ---------------- */}
      {heroVideo && (
        <section className="relative isolate overflow-hidden bg-ink text-paper">
          <div className="absolute inset-0 -z-10">
            <VideoLoop video={heroVideo} />
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/20" />
          </div>
          <div className="mx-auto grid max-w-[1440px] gap-12 px-4 py-28 sm:px-8 lg:grid-cols-12 lg:py-36">
            <div className="lg:col-span-6">
              <p className="label text-paper/55">Fixation aimantée</p>
              <h2 className="display mt-4 text-[64px] sm:text-[96px]">
                30 secondes.
                <br />
                Zéro trou.
              </h2>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-paper/70">
                Chaque plaque est livrée avec son aimant adhésif. Vous le collez, vous approchez l&apos;œuvre : elle se
                pose d&apos;elle-même. Envie de changer ? Elle se retire aussi vite.
              </p>
            </div>
            <ol className="self-end lg:col-span-5 lg:col-start-8">
              {[
                ["Collez l'aimant", "Sur un mur propre et sec. Il tient sur peinture, béton, carrelage."],
                ["Approchez la plaque", "Clac. Elle se place toute seule, parfaitement à plat."],
                ["Changez quand vous voulez", "Le même aimant reçoit n'importe quelle plaque ArtForge."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-6 border-t border-paper/15 py-6">
                  <span className="display text-[40px] text-ember">0{i + 1}</span>
                  <div>
                    <p className="text-[17px] font-semibold">{t}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-paper/60">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* ---------------- Sizes ---------------- */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="label text-stone">Formats</p>
            <h2 className="display mt-3 text-[52px] sm:text-[72px]">
              Quatre tailles,
              <br />à l&apos;échelle.
            </h2>
            <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-stone">
              Du 20 × 30 cm qui habille une étagère au 60 × 90 cm qui tient tout un mur. Les œuvres en paysage sont
              simplement tournées.
            </p>
            <Link href="/aide#tailles" className="label link-u mt-6 inline-flex items-center gap-1.5">
              Guide des tailles <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="lg:col-span-8 lg:pt-10">{sizeArt && <SizesToScale art={sizeArt} />}</div>
        </div>
      </section>

      {/* ---------------- Custom ---------------- */}
      <section className="bg-paper-2">
        <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-4 py-24 sm:px-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="label text-stone">Sur mesure</p>
            <h2 className="display mt-3 text-[60px] sm:text-[88px]">
              Votre photo.
              <br />
              <span className="text-ember">Notre métal.</span>
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-ink/70">
              Un souvenir de voyage, un dessin de votre enfant, le logo de votre café. Importez votre image, cadrez-la,
              regardez-la en 3D puis accrochée dans un salon, un bureau ou sur une photo de votre propre mur.
            </p>
            <ul className="mt-8 space-y-3 text-[14px]">
              {[
                "Contrôle automatique de la qualité d'impression",
                "Aperçu 3D et mise en situation chez vous",
                "Plaques et coques de téléphone, même prix que le catalogue",
              ].map((t) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-[7px] h-[2px] w-4 shrink-0 bg-ember" />
                  {t}
                </li>
              ))}
            </ul>
            <Link
              href="/creer"
              className="group mt-10 inline-flex items-center gap-4 bg-ink px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-ember"
            >
              Créer la mienne
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="lg:col-span-7">
            <RoomTeaser arts={featured(8)} />
          </div>
        </div>
      </section>

      {/* ---------------- Cases ---------------- */}
      <section className="overflow-hidden bg-ink text-paper">
        <div className="mx-auto grid max-w-[1440px] items-center gap-14 px-4 py-24 sm:px-8 lg:grid-cols-12">
          <div className="relative order-2 flex h-[440px] items-center justify-center lg:order-1 lg:col-span-7 lg:h-[560px]">
            {caseArts.map((a, i) => {
              const phone = getPhone(["iphone-16-pro", "galaxy-s25", "iphone-17"][i]);
              const pos = [
                "-translate-x-[70%] -rotate-[9deg] translate-y-6",
                "z-10 -translate-y-4",
                "translate-x-[70%] rotate-[8deg] translate-y-8",
              ][i];
              return (
                <Link
                  key={a.slug}
                  href={`/oeuvre/${a.slug}?support=coque`}
                  className={`absolute h-[78%] transition-transform duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-8 ${pos}`}
                >
                  <PhoneMockup image={a.image} phone={phone} className="h-full" />
                </Link>
              );
            })}
          </div>
          <div className="order-1 lg:order-2 lg:col-span-5">
            <p className="label text-paper/50">Coques de téléphone</p>
            <h2 className="display mt-3 text-[56px] sm:text-[80px]">
              Votre œuvre
              <br />
              préférée,
              <br />
              en poche.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-paper/65">
              Toutes les œuvres du catalogue, et vos propres images, imprimées en UV sur coque rigide ou antichoc. iPhone,
              Samsung, Xiaomi.
            </p>
            <p className="mt-6 text-[15px]">
              {CASE_TYPES.map((c) => (
                <span key={c.id} className="mr-6 inline-block">
                  <span className="text-paper/55">{c.label}</span>{" "}
                  <strong className="tabular-nums">{formatDH(c.price)}</strong>
                </span>
              ))}
            </p>
            <Link
              href="/coques"
              className="group mt-9 inline-flex items-center gap-4 bg-paper px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-ember hover:text-white"
            >
              Voir les coques
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- New ---------------- */}
      <section className="mx-auto max-w-[1440px] px-4 py-24 sm:px-8">
        <SectionHead kicker="Arrivées récentes" title="Nouveautés" link={{ href: "/boutique?tri=nouveautes", label: "Voir les nouveautés" }} />
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {fresh.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 4) * 70}>
              <ArtCard art={a} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Craft ---------------- */}
      <section className="border-t border-ink/10">
        <div className="mx-auto grid max-w-[1440px] gap-14 px-4 py-24 sm:px-8 lg:grid-cols-12">
          <div className="grid grid-cols-5 gap-4 lg:col-span-7">
            {craftVideo && (
              <div className="col-span-3 aspect-[3/4] overflow-hidden bg-ink">
                <VideoLoop video={craftVideo} />
              </div>
            )}
            <div className="col-span-2 flex flex-col gap-4">
              {lifestyleVideo && (
                <div className="aspect-square overflow-hidden bg-ink">
                  <VideoLoop video={lifestyleVideo} />
                </div>
              )}
              {textureVideo && (
                <div className="flex-1 overflow-hidden bg-ink">
                  <VideoLoop video={textureVideo} />
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-5 lg:pl-6">
            <p className="label text-stone">L&apos;atelier</p>
            <h2 className="display mt-3 text-[52px] sm:text-[72px]">
              Imprimée ici,
              <br />
              vérifiée à la main.
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-ink/70">
              Chaque commande est imprimée dans notre atelier de Casablanca, contrôlée sous lumière rasante, emballée
              entre deux plaques de carton rigide puis confiée au livreur.
            </p>
            <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10 text-[14px]">
              {[
                ["Support", "Métal 1 mm, coins adoucis"],
                ["Impression", "UV directe, CMJN + blanc"],
                ["Résistance", "Eau, UV, rayures du quotidien"],
                ["Fixation", "Aimant adhésif fourni"],
                ["Production", "48 h ouvrées"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-6 py-3">
                  <dt className="text-stone">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <Link href="/atelier" className="label link-u mt-8 inline-flex items-center gap-1.5">
              Découvrir l&apos;atelier <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
