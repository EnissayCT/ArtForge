import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { mixed } from "@/lib/catalog";
import { BRANDS, PHONES, getPhone } from "@/lib/phones";
import { CASE_TYPES, formatDH } from "@/lib/pricing";
import { PhoneMockup } from "@/components/phone/PhoneMockup";

export const metadata: Metadata = {
  title: "Coques de téléphone imprimées UV",
  description: "Coques iPhone, Samsung et Xiaomi imprimées UV avec les œuvres ArtForge ou votre propre image. Paiement à la livraison.",
};

const SHOWCASE = ["iphone-17-pro", "iphone-16", "galaxy-s25-ultra", "iphone-15-pro", "redmi-note-14-pro", "galaxy-s25", "iphone-17-pro-max", "iphone-14"];

export default function CasesPage() {
  const arts = mixed(16, 2);
  return (
    <>
      <section className="overflow-hidden bg-ink text-paper">
        <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-12 lg:py-24">
          <div className="lg:col-span-5">
            <p className="label text-paper/50">Coques de téléphone</p>
            <h1 className="display mt-4 text-[72px] sm:text-[120px]">
              Le musée,
              <br />
              <span className="text-ember">en poche.</span>
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-paper/70">
              Impression UV bord à bord, directement dans la matière : rien ne se décolle, rien ne s&apos;efface.
              {" "}{PHONES.length} modèles {BRANDS.join(", ")}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/creer?support=coque"
                className="group flex items-center gap-4 bg-paper px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink transition-colors hover:bg-ember hover:text-white"
              >
                Ma photo sur une coque <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-2 gap-px bg-paper/15">
              {CASE_TYPES.map((c) => (
                <div key={c.id} className="bg-ink py-4 pr-4">
                  <p className="flex items-baseline justify-between pr-4">
                    <span className="display-semi text-2xl">{c.label}</span>
                    <span className="font-semibold tabular-nums">{formatDH(c.price)}</span>
                  </p>
                  <p className="mt-1 text-[13px] text-paper/55">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="relative flex h-[460px] items-center justify-center lg:col-span-7 lg:h-[620px]">
            {arts.slice(0, 3).map((a, i) => (
              <Link
                key={a.slug}
                href={`/oeuvre/${a.slug}?support=coque`}
                className={
                  "absolute h-[80%] transition-transform duration-700 ease-[var(--ease-out-expo)] hover:-translate-y-6 " +
                  ["-translate-x-[72%] -rotate-[10deg] translate-y-8", "z-10", "translate-x-[72%] rotate-[9deg] translate-y-10"][i]
                }
              >
                <PhoneMockup image={a.image} phone={getPhone(["galaxy-s25", "iphone-17-pro", "iphone-16"][i])} className="h-full" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-8">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="label text-stone">Toutes les œuvres existent en coque</p>
            <h2 className="display mt-3 text-[48px] sm:text-[72px]">Choisissez la vôtre</h2>
          </div>
          <Link href="/boutique" className="label link-u flex items-center gap-1.5 pb-2">
            Voir tout le catalogue <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {arts.map((a, i) => {
            const phone = getPhone(SHOWCASE[i % SHOWCASE.length]);
            return (
              <Link key={a.slug} href={`/oeuvre/${a.slug}?support=coque`} className="group">
                <div className="grid aspect-[4/5] place-items-center bg-paper-2 transition-colors duration-500 group-hover:bg-paper-3">
                  <PhoneMockup
                    image={a.image}
                    phone={phone}
                    className="h-[78%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-2 group-hover:-rotate-2"
                  />
                </div>
                <div className="mt-3 flex items-start justify-between gap-x-3 gap-y-1 max-sm:flex-col max-sm:items-stretch">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold">{a.title}</p>
                    <p className="truncate text-[13px] text-stone">{phone.name} · et {PHONES.length - 1} autres modèles</p>
                  </div>
                  <p className="label shrink-0 pt-0.5 text-ink/70">{formatDH(CASE_TYPES[0].price)}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="border-t border-ink/10 bg-paper-2">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8">
          <p className="label mb-6 text-stone">Modèles disponibles</p>
          <div className="grid gap-8 sm:grid-cols-3">
            {BRANDS.map((b) => (
              <div key={b}>
                <p className="display-semi text-2xl">{b}</p>
                <ul className="mt-3 space-y-1 text-[14px] text-ink/75">
                  {PHONES.filter((p) => p.brand === b).map((p) => (
                    <li key={p.id}>{p.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-8 text-[13px] text-stone">Un autre modèle ? Écrivez-nous sur WhatsApp, nous l&apos;ajoutons sous 48 h.</p>
        </div>
      </section>
    </>
  );
}
