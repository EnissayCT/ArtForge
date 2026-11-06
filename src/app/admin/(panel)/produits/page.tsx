import Link from "next/link";
import Image from "next/image";
import { Plus, Search } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getCatalogData } from "@/lib/data";
import { ProductToggles } from "@/components/admin/ProductToggles";
import { cn } from "@/lib/utils";

export const metadata = { title: "Produits" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string; vue?: string; supprime?: string }>;
}) {
  await requireAdmin();
  const { q = "", c, vue, supprime } = await searchParams;
  const data = await getCatalogData();
  const needle = q.trim().toLowerCase();
  const list = data.artworks.filter(
    (a) =>
      (!c || a.collection === c) &&
      (vue === "masquees" ? a.hidden : vue === "vedettes" ? a.featured : true) &&
      (!needle || [a.title, a.artist, ...a.tags].some((v) => v.toLowerCase().includes(needle))),
  );
  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: q || undefined, c, vue, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return s ? `/admin/produits?${s}` : "/admin/produits";
  };
  const visible = data.artworks.filter((a) => !a.hidden).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-stone">Produits</p>
          <h1 className="display mt-2 text-[44px] sm:text-[56px]">{data.artworks.length} œuvres</h1>
          <p className="mt-1 text-[13px] text-stone">
            {visible} visibles dans la boutique · chacune est vendue en plaque (tous formats) et en coque
          </p>
        </div>
        <Link href="/admin/produits/nouveau" className="flex items-center gap-2 bg-ink px-4 py-2.5 text-[13px] font-semibold text-paper hover:bg-ember">
          <Plus className="size-4" /> Ajouter une œuvre
        </Link>
      </div>
      {supprime && <p className="mt-4 text-[13px] text-ok">Œuvre supprimée.</p>}

      <form className="mt-6 flex items-center gap-3 border-b border-ink/25 pb-2 focus-within:border-ink sm:max-w-md" action="/admin/produits">
        <Search className="size-4 shrink-0 text-stone" />
        <input name="q" defaultValue={q} placeholder="Titre, artiste, mot-clé" className="w-full bg-transparent py-1 text-[15px] outline-none" />
        {c && <input type="hidden" name="c" value={c} />}
        {vue && <input type="hidden" name="vue" value={vue} />}
      </form>

      <div className="no-scrollbar -mx-4 mt-5 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        {[
          [undefined, "Toutes"],
          ["vedettes", "En vedette"],
          ["masquees", "Masquées"],
        ].map(([id, label]) => (
          <Link
            key={label}
            href={href({ vue: id })}
            className={cn("shrink-0 px-3 py-1.5 text-[13px] font-medium", vue === id ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper-3")}
          >
            {label}
          </Link>
        ))}
        <span className="mx-1 w-px shrink-0 bg-ink/15" />
        <Link href={href({ c: undefined })} className={cn("shrink-0 px-3 py-1.5 text-[13px]", !c ? "font-semibold underline" : "text-ink/70")}>
          Toutes collections
        </Link>
        {data.collections.map((col) => (
          <Link
            key={col.slug}
            href={href({ c: col.slug })}
            className={cn("shrink-0 px-3 py-1.5 text-[13px]", c === col.slug ? "font-semibold underline" : "text-ink/70 hover:text-ink")}
          >
            {col.name}
          </Link>
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-stone">Aucune œuvre ne correspond.</p>
      ) : (
        <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {list.map((a) => (
            <li key={a.slug} className={cn(a.hidden && "opacity-55")}>
              <Link href={`/admin/produits/${a.slug}`} className="group block">
                <div className="relative grid aspect-[4/5] place-items-center bg-paper-2">
                  <div className={cn("relative overflow-hidden", a.w > a.h * 1.05 ? "aspect-[4/3] w-[80%]" : "aspect-[3/4] w-[66%]")} style={{ background: a.color }}>
                    <Image src={a.image} alt="" fill sizes="200px" className="object-cover" />
                  </div>
                  {a.hidden && <span className="label absolute left-2 top-2 bg-ink px-1.5 py-0.5 text-[9.5px] text-paper">Masquée</span>}
                </div>
                <p className="mt-2 truncate text-[14px] font-semibold group-hover:underline">{a.title}</p>
                <p className="truncate text-[12px] text-stone">
                  {a.artist} · {data.collections.find((x) => x.slug === a.collection)?.name ?? a.collection}
                </p>
              </Link>
              <ProductToggles slug={a.slug} featured={!!a.featured} hidden={!!a.hidden} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
