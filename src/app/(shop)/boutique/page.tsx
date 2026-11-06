import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { isLandscape, type Artwork } from "@/lib/catalog";
import { getCatalog } from "@/lib/data";
import { ArtCard } from "@/components/product/ArtCard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Boutique — toutes les affiches en métal",
  description: "Toutes nos œuvres en affiche métal : estampes japonaises, espace, grands maîtres, abstrait, affiches vintage.",
};

type Params = { q?: string; c?: string; tri?: string; o?: string };

const SORTS = [
  { id: "tendances", label: "Tendances" },
  { id: "nouveautes", label: "Nouveautés" },
  { id: "az", label: "A → Z" },
];

function href(base: Params, patch: Partial<Params>) {
  const p = { ...base, ...patch };
  const qs = new URLSearchParams();
  Object.entries(p).forEach(([k, v]) => v && qs.set(k, v));
  const s = qs.toString();
  return s ? `/boutique?${s}` : "/boutique";
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const catalog = await getCatalog();
  const { artworks: ARTWORKS, collections: COLLECTIONS } = catalog;
  const { q = "", c, tri = "tendances", o } = params;

  let list: Artwork[] = q ? catalog.search(q) : catalog.mixed(ARTWORKS.length);
  if (c) list = list.filter((a) => a.collection === c);
  if (o === "portrait") list = list.filter((a) => !isLandscape(a));
  if (o === "paysage") list = list.filter((a) => isLandscape(a));
  if (tri === "nouveautes") list = [...list].reverse();
  if (tri === "az") list = [...list].sort((a, b) => a.title.localeCompare(b.title, "fr"));

  const active = COLLECTIONS.find((x) => x.slug === c);

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-10 sm:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6 border-b border-ink/12 pb-8">
        <div>
          <p className="label text-stone">Boutique</p>
          <h1 className="display mt-3 text-[56px] sm:text-[88px]">
            {q ? <>« {q} »</> : active ? active.name : "Toutes les œuvres"}
          </h1>
          <p className="mt-3 text-[14px] text-stone">
            {list.length} œuvre{list.length > 1 ? "s" : ""} · chaque pièce existe en plusieurs formats et en coque
          </p>
        </div>
        <form action="/boutique" className="flex w-full items-center gap-3 border-b border-ink/30 pb-2 focus-within:border-ink sm:w-[340px]">
          <Search className="size-4 shrink-0" strokeWidth={1.6} />
          <input
            name="q"
            defaultValue={q}
            placeholder="Rechercher une œuvre, un artiste…"
            className="w-full bg-transparent py-1.5 text-[15px] outline-none placeholder:text-stone"
            aria-label="Rechercher"
          />
          {c && <input type="hidden" name="c" value={c} />}
        </form>
      </div>

      <div className="sticky top-16 z-30 -mx-4 border-b border-ink/10 bg-paper/95 px-4 py-3 sm:-mx-8 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1">
            <Link
              href={href(params, { c: undefined })}
              className={cn(
                "shrink-0 px-3 py-1.5 text-[13px] font-medium transition-colors",
                !c ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper-3",
              )}
            >
              Tout
            </Link>
            {COLLECTIONS.map((col) => (
              <Link
                key={col.slug}
                href={href(params, { c: col.slug })}
                className={cn(
                  "shrink-0 px-3 py-1.5 text-[13px] font-medium transition-colors",
                  c === col.slug ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper-3",
                )}
              >
                {col.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <div className="flex gap-3">
              {[
                [undefined, "Tous formats"],
                ["portrait", "Portrait"],
                ["paysage", "Paysage"],
              ].map(([id, label]) => (
                <Link
                  key={label}
                  href={href(params, { o: id })}
                  className={cn("link-u", o === id && "font-semibold")}
                  aria-current={o === id ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </div>
            <span className="hidden h-4 w-px bg-ink/15 sm:block" />
            <div className="flex gap-3">
              {SORTS.map((s) => (
                <Link
                  key={s.id}
                  href={href(params, { tri: s.id === "tendances" ? undefined : s.id })}
                  className={cn("link-u", tri === s.id && "font-semibold")}
                  aria-current={tri === s.id ? "page" : undefined}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="py-24">
          <p className="display text-[44px]">Aucune œuvre trouvée.</p>
          <p className="mt-3 text-stone">Essayez un autre mot-clé, ou imprimez votre propre image.</p>
          <div className="mt-6 flex gap-4">
            <Link href="/boutique" className="label link-u">Réinitialiser</Link>
            <Link href="/creer" className="label link-u">Créer la vôtre →</Link>
          </div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {list.map((a, i) => (
            <ArtCard key={a.slug} art={a} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
