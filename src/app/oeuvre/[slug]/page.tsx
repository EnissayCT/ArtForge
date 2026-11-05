import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARTWORKS, getArtwork, getCollection, related } from "@/lib/catalog";
import { ProductView } from "@/components/product/ProductView";
import { ArtCard } from "@/components/product/ArtCard";
import { SIZES, formatDH } from "@/lib/pricing";

export function generateStaticParams() {
  return ARTWORKS.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const art = getArtwork(slug);
  if (!art) return {};
  return {
    title: `${art.title} — ${art.artist}`,
    description: `${art.title} (${art.artist}, ${art.year}) en affiche métal imprimée UV, dès ${formatDH(SIZES[0].price)}. Fixation aimantée, paiement à la livraison au Maroc.`,
    openGraph: { images: [art.image] },
  };
}

export default async function ArtworkPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ support?: string }>;
}) {
  const { slug } = await params;
  const { support } = await searchParams;
  const art = getArtwork(slug);
  if (!art) notFound();
  const collection = getCollection(art.collection);
  const more = related(art, 4);

  return (
    <>
      <ProductView art={art} collection={collection} initialKind={support === "coque" ? "case" : "plate"} />
      <section className="mx-auto max-w-[1440px] px-4 pb-24 pt-14 sm:px-8">
        <div className="mb-8 flex items-end justify-between border-t border-ink/12 pt-8">
          <h2 className="display text-[40px] sm:text-[52px]">Dans la même veine</h2>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4">
          {more.map((a) => (
            <ArtCard key={a.slug} art={a} />
          ))}
        </div>
      </section>
    </>
  );
}
