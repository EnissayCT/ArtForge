"use client";

import Link from "next/link";
import { useWishlist } from "@/lib/wishlist";
import { useHydrated } from "@/lib/hooks";
import type { Artwork } from "@/lib/catalog";
import { useCatalog, useShop } from "@/components/providers/ShopProvider";
import { ArtCard } from "@/components/product/ArtCard";

export default function WishlistPage() {
  const hydrated = useHydrated();
  const slugs = useWishlist((s) => s.slugs);
  const catalog = useCatalog();
  const { bundle } = useShop();
  const arts = (hydrated ? slugs : []).map((s) => catalog.get(s)).filter(Boolean) as Artwork[];
  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-24 pt-10 sm:px-8">
      <p className="label text-stone">Vos favoris</p>
      <h1 className="display mt-3 text-[60px] sm:text-[96px]">Le mur idéal</h1>
      {hydrated && arts.length === 0 ? (
        <div className="py-14">
          <p className="max-w-md text-[16px] text-stone">
            Touchez le cœur sur une œuvre pour la garder ici. Pratique pour composer un mur de plusieurs plaques{bundle.percent > 0 ? ` (−${bundle.percent} % dès ${bundle.minPlates})` : ""}.
          </p>
          <Link href="/boutique" className="label link-u mt-6 inline-block">Parcourir la boutique →</Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 xl:grid-cols-4">
          {arts.map((a) => (
            <ArtCard key={a.slug} art={a} />
          ))}
        </div>
      )}
    </div>
  );
}
