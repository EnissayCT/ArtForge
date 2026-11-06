"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Rotate3d } from "lucide-react";
import { useQuickView } from "@/components/viewer/QuickView3D";
import type { Artwork } from "@/lib/catalog";
import { isLandscape } from "@/lib/catalog";
import { formatDH } from "@/lib/pricing";
import { useShop } from "@/components/providers/ShopProvider";
import { useWishlist } from "@/lib/wishlist";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";

export function ArtCard({
  art,
  priority,
  tone = "paper",
  className,
}: {
  art: Artwork;
  priority?: boolean;
  tone?: "paper" | "ink";
  className?: string;
}) {
  const landscape = isLandscape(art);
  const hydrated = useHydrated();
  const liked = useWishlist((s) => s.slugs.includes(art.slug));
  const toggle = useWishlist((s) => s.toggle);
  const showQuick = useQuickView((s) => s.show);
  const { fromPrice } = useShop();

  return (
    <article className={cn("group relative", className)}>
      <Link href={`/oeuvre/${art.slug}`} className="block" aria-label={`${art.title}, ${art.artist}`}>
        <div
          className={cn(
            "relative grid aspect-[4/5] place-items-center overflow-hidden transition-colors duration-500",
            tone === "paper" ? "bg-paper-2 group-hover:bg-paper-3" : "bg-ink-2 group-hover:bg-ink-3",
          )}
        >
          <div
            className={cn(
              "glint glint-strong plate relative transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:-translate-y-1.5",
              landscape ? "aspect-[4/3] w-[80%]" : "aspect-[3/4] w-[66%]",
            )}
            style={{ backgroundColor: art.color }}
          >
            <Image
              src={art.image}
              alt=""
              fill
              priority={priority}
              sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 45vw"
              className="rounded-[2px] object-cover"
            />
          </div>
        </div>
      </Link>
      <button
        type="button"
        onClick={() => toggle(art.slug)}
        aria-pressed={hydrated && liked}
        aria-label={liked ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={cn(
          "absolute right-2.5 top-2.5 grid size-9 place-items-center rounded-full transition-all duration-300",
          tone === "paper" ? "bg-paper/80 text-ink hover:bg-paper" : "bg-ink/60 text-paper hover:bg-ink",
          hydrated && liked ? "opacity-100" : "opacity-0 group-hover:opacity-100 focus-visible:opacity-100 max-md:opacity-100",
        )}
      >
        <Heart className={cn("size-4", hydrated && liked && "fill-ember stroke-ember")} strokeWidth={1.7} />
      </button>
      <button
        type="button"
        onClick={() => showQuick(art)}
        className={cn(
          "label absolute left-2.5 top-2.5 flex h-9 items-center gap-1.5 rounded-full px-3 text-[10px] opacity-0 transition-opacity duration-300 group-hover:opacity-100 focus-visible:opacity-100 max-md:hidden",
          tone === "paper" ? "bg-paper/80 text-ink hover:bg-paper" : "bg-ink/60 text-paper hover:bg-ink",
        )}
      >
        <Rotate3d className="size-3.5" strokeWidth={1.7} /> 3D
      </button>
      <div className="mt-3 flex items-start justify-between gap-x-3 gap-y-1 max-sm:flex-col max-sm:items-stretch">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold leading-tight">
            <Link href={`/oeuvre/${art.slug}`}>{art.title}</Link>
          </h3>
          <p className={cn("mt-0.5 truncate text-[13px]", tone === "paper" ? "text-stone" : "text-paper/55")}>
            {art.artist}
          </p>
        </div>
        <p className={cn("label shrink-0 sm:pt-0.5", tone === "paper" ? "text-ink/70" : "text-paper/70")}>
          dès {formatDH(fromPrice)}
        </p>
      </div>
    </article>
  );
}
