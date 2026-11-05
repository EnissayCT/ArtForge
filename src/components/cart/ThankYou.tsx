"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useHydrated } from "@/lib/hooks";
import { Check, MessageCircle } from "lucide-react";
import { Mark } from "@/components/brand/Logo";
import { formatDH } from "@/lib/pricing";
import { SITE } from "@/lib/site";

interface Last {
  number: string;
  total: number;
  name: string;
  city: string;
  summary: string;
}

function readLast(number: string): Last | null {
  try {
    const raw = sessionStorage.getItem("artforge-last-order");
    const parsed = raw ? (JSON.parse(raw) as Last) : null;
    return parsed?.number === number ? parsed : null;
  } catch {
    return null;
  }
}

export function ThankYou({ number }: { number: string }) {
  const hydrated = useHydrated();
  const last = useMemo(() => (hydrated ? readLast(number) : null), [hydrated, number]);

  const text = last
    ? `Bonjour ArtForge, je confirme ma commande ${last.number} (${formatDH(last.total)}, livraison à ${last.city}).\n\n${last.summary}`
    : `Bonjour ArtForge, je confirme ma commande ${number}.`;
  const wa = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(text)}`;

  return (
    <div className="relative overflow-hidden bg-ink text-paper">
      <Mark className="pointer-events-none absolute -right-20 top-10 h-[520px] w-auto text-paper/[0.04]" />
      <div className="relative mx-auto max-w-[1100px] px-4 py-24 sm:px-8 sm:py-32">
        <span className="grid size-14 place-items-center rounded-full bg-ember">
          <Check className="size-7" />
        </span>
        <p className="label mt-8 text-paper/55">Commande {number}</p>
        <h1 className="display mt-3 text-[64px] sm:text-[110px]">
          Merci{last?.name ? `, ${last.name.split(" ")[0]}` : ""}.
          <br />
          <span className="text-ember">C&apos;est lancé.</span>
        </h1>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-paper/70">
          Nous vous contactons très vite pour confirmer la commande, puis elle part à l&apos;impression.
          {last && (
            <>
              {" "}Vous paierez <strong className="text-paper">{formatDH(last.total)}</strong> au livreur, à {last.city}.
            </>
          )}
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-3 bg-[#25d366] px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-ink transition-opacity hover:opacity-90"
          >
            <MessageCircle className="size-4" /> Confirmer sur WhatsApp
          </a>
          <Link href="/boutique" className="flex items-center gap-3 border border-paper/30 px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] hover:border-paper">
            Continuer mes achats
          </Link>
        </div>
        <ol className="mt-20 grid gap-px bg-paper/10 sm:grid-cols-4">
          {[
            ["Confirmation", "Appel ou WhatsApp sous 24 h"],
            ["Impression", "48 h dans notre atelier"],
            ["Livraison", "24 à 72 h selon la ville"],
            ["Paiement", "En espèces, colis en main"],
          ].map(([t, d], i) => (
            <li key={t} className="bg-ink p-5">
              <p className="label text-ember">0{i + 1}</p>
              <p className="mt-2 font-semibold">{t}</p>
              <p className="mt-1 text-[13px] text-paper/55">{d}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
