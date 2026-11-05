"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { COLLECTIONS, search, mixed, getCollection } from "@/lib/catalog";
import { useEscape, useLockBody } from "@/lib/hooks";
import { cn } from "@/lib/utils";

const SUGGESTIONS = ["Hokusai", "Nébuleuse", "Van Gogh", "Tanger", "Kandinsky", "Fleurs", "Mucha"];

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useLockBody(open);
  useEscape(onClose, open);

  useEffect(() => {
    if (open) setTimeout(() => input.current?.focus(), 60);
  }, [open]);

  const results = useMemo(() => (q.trim() ? search(q).slice(0, 12) : mixed(6, 3)), [q]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Recherche"
      className={cn(
        "fixed inset-0 z-[60] overflow-y-auto bg-paper transition-[opacity,visibility] duration-300",
        open ? "visible opacity-100" : "invisible opacity-0",
      )}
    >
      <div className="mx-auto max-w-[1200px] px-4 pb-20 pt-6 sm:px-8">
        <div className="flex justify-end">
          <button onClick={onClose} className="label flex items-center gap-2 p-2" aria-label="Fermer la recherche">
            Fermer <X className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (q.trim()) window.location.href = `/boutique?q=${encodeURIComponent(q.trim())}`;
          }}
          className="mt-6 flex items-center gap-4 border-b-2 border-ink pb-3"
        >
          <Search className="size-7 shrink-0" strokeWidth={1.5} />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Une œuvre, un artiste, une envie…"
            className="display-semi w-full bg-transparent text-[34px] outline-none placeholder:text-stone-2 sm:text-[52px]"
            aria-label="Rechercher une œuvre"
          />
        </form>
        <div className="mt-5 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setQ(s)}
              className="border border-ink/15 px-3 py-1.5 text-[13px] transition-colors hover:border-ink"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-12 flex items-baseline justify-between">
          <p className="label text-stone">
            {q.trim() ? `${search(q).length} résultat(s)` : "Suggestions"}
          </p>
          {q.trim() && (
            <Link href={`/boutique?q=${encodeURIComponent(q.trim())}`} onClick={onClose} className="label link-u flex items-center gap-1">
              Tout voir <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
          {results.map((a) => (
            <Link key={a.slug} href={`/oeuvre/${a.slug}`} onClick={onClose} className="group">
              <div className="glint plate relative aspect-[3/4] overflow-hidden" style={{ background: a.color }}>
                <Image src={a.image} alt="" fill sizes="200px" className="object-cover" />
              </div>
              <p className="mt-2.5 truncate text-[14px] font-semibold">{a.title}</p>
              <p className="truncate text-[12px] text-stone">{getCollection(a.collection)?.name}</p>
            </Link>
          ))}
        </div>
        {q.trim() && results.length === 0 && (
          <div className="py-10">
            <p className="display-semi text-3xl">Rien de ce côté-là.</p>
            <p className="mt-2 text-stone">
              Essayez un autre mot, ou imprimez votre propre image sur métal.
            </p>
            <Link href="/creer" onClick={onClose} className="label link-u mt-4 inline-block">
              Créer la vôtre →
            </Link>
          </div>
        )}
        <div className="mt-16 border-t border-ink/10 pt-8">
          <p className="label mb-4 text-stone">Parcourir</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {COLLECTIONS.map((c) => (
              <Link key={c.slug} href={`/collections/${c.slug}`} onClick={onClose} className="display-semi link-u text-2xl">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
