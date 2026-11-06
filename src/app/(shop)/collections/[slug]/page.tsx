import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getCatalog } from "@/lib/data";
import { ArtCard } from "@/components/product/ArtCard";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = (await getCatalog()).collection(slug);
  return c ? { title: `${c.name} — affiches en métal`, description: c.description } : {};
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const catalog = await getCatalog();
  const c = catalog.collection(slug);
  if (!c) notFound();
  const works = catalog.byCollection(slug);
  const cover = catalog.cover(slug);
  const others = catalog.collections.filter((x) => x.slug !== slug);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-paper">
        {cover && (
          <div className="absolute inset-0 -z-10">
            <Image src={cover.image} alt="" fill priority sizes="100vw" className="scale-110 object-cover opacity-45 blur-[2px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
          </div>
        )}
        <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-24 sm:px-8 sm:pt-36">
          <Link href="/collections" className="label text-paper/60 hover:text-paper">
            ← Collections
          </Link>
          <p className="label mt-8 text-ember">{c.kicker}</p>
          <h1 className="display mt-3 text-[72px] sm:text-[140px]">{c.name}</h1>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
            <p className="max-w-xl text-[17px] leading-relaxed text-paper/75">{c.description}</p>
            <p className="label text-paper/55">{works.length} œuvres</p>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8">
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {works.map((a, i) => (
            <ArtCard key={a.slug} art={a} priority={i < 4} />
          ))}
        </div>
      </section>
      <section className="border-t border-ink/10">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8">
          <p className="label mb-5 text-stone">Autres collections</p>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {others.map((o) => (
              <Link key={o.slug} href={`/collections/${o.slug}`} className="display link-u text-[32px] sm:text-[40px]">
                {o.name}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
