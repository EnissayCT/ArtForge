import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { COLLECTIONS, byCollection } from "@/lib/catalog";

export const metadata: Metadata = { title: "Collections" };

export default function CollectionsPage() {
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-10 sm:px-8">
      <p className="label text-stone">Collections</p>
      <h1 className="display mt-3 text-[64px] sm:text-[110px]">
        {({ 7: "Sept", 8: "Huit", 9: "Neuf", 10: "Dix" } as Record<number, string>)[COLLECTIONS.length] ?? COLLECTIONS.length} univers
      </h1>
      <div className="mt-12 divide-y divide-ink/12 border-y border-ink/12">
        {COLLECTIONS.map((c, i) => {
          const works = byCollection(c.slug).slice(0, 4);
          return (
            <Link key={c.slug} href={`/collections/${c.slug}`} className="group grid items-center gap-6 py-8 lg:grid-cols-12">
              <div className="flex items-baseline gap-5 lg:col-span-5">
                <span className="label text-stone">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <p className="display text-[48px] transition-transform duration-500 group-hover:translate-x-2 sm:text-[64px]">{c.name}</p>
                  <p className="mt-2 max-w-md text-[14px] leading-relaxed text-stone">{c.description}</p>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3 lg:col-span-6">
                {works.map((a) => (
                  <div key={a.slug} className="glint plate relative aspect-[3/4] overflow-hidden" style={{ background: a.color }}>
                    <Image src={a.image} alt="" fill sizes="(min-width:1024px) 12vw, 22vw" className="object-cover" />
                  </div>
                ))}
              </div>
              <div className="hidden justify-end lg:col-span-1 lg:flex">
                <span className="grid size-12 place-items-center rounded-full border border-ink/20 transition-colors group-hover:bg-ink group-hover:text-paper">
                  <ArrowUpRight className="size-5" strokeWidth={1.5} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
