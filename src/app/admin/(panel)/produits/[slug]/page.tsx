import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { getCatalogData } from "@/lib/data";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Œuvre" };

export default async function ProductPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ cree?: string }> }) {
  await requireAdmin();
  const { slug } = await params;
  const { cree } = await searchParams;
  const data = await getCatalogData();
  const isNew = slug === "nouveau";
  const art = isNew ? undefined : data.artworks.find((a) => a.slug === slug);
  if (!isNew && !art) notFound();

  return (
    <div className="max-w-4xl">
      <Link href="/admin/produits" className="label flex items-center gap-1.5 text-stone hover:text-ink">
        <ArrowLeft className="size-3.5" /> Produits
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-[40px] sm:text-[52px]">{art ? art.title : "Nouvelle œuvre"}</h1>
        {art && !art.hidden && (
          <a href={`/oeuvre/${art.slug}`} target="_blank" rel="noreferrer" className="label flex items-center gap-1.5 text-stone hover:text-ink">
            Voir dans la boutique <ExternalLink className="size-3.5" />
          </a>
        )}
      </div>
      {cree && <p className="mt-3 text-[13px] text-ok">Œuvre créée et publiée.</p>}
      <ProductForm art={art} collections={data.collections} />
    </div>
  );
}
