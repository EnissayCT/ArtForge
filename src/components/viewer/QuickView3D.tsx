"use client";

import Link from "next/link";
import { useCallback } from "react";
import { create } from "zustand";
import { ArrowRight, Rotate3d, X } from "lucide-react";
import type { Artwork } from "@/lib/catalog";
import { isLandscape } from "@/lib/catalog";
import { formatDH } from "@/lib/pricing";
import { useShop } from "@/components/providers/ShopProvider";
import { useEscape, useLockBody } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { PlateViewer } from "./lazy";

export const useQuickView = create<{ art: Artwork | null; show: (a: Artwork) => void; hide: () => void }>((set) => ({
  art: null,
  show: (art) => set({ art }),
  hide: () => set({ art: null }),
}));

export function QuickView3D() {
  const art = useQuickView((s) => s.art);
  const hide = useQuickView((s) => s.hide);
  const close = useCallback(() => hide(), [hide]);
  const shop = useShop();
  const def = shop.size(shop.defaultSize);
  useLockBody(!!art);
  useEscape(close, !!art);

  return (
    <div className={cn("fixed inset-0 z-[80]", art ? "visible" : "invisible")}>
      <div onClick={close} className={cn("absolute inset-0 bg-ink/80 transition-opacity duration-500", art ? "opacity-100" : "opacity-0")} />
      {art && (
        <div className="absolute inset-3 flex animate-fade-up flex-col overflow-hidden bg-ink text-paper sm:inset-8 lg:inset-x-[8vw] lg:inset-y-10">
          <div className="flex items-center justify-between border-b border-paper/10 px-5 py-4">
            <div className="min-w-0">
              <p className="label text-paper/50">Vue 3D · {def.w} × {def.h} cm · Brillant</p>
              <p className="display-semi truncate text-2xl">{art.title}</p>
            </div>
            <button onClick={close} className="p-2" aria-label="Fermer">
              <X className="size-6" strokeWidth={1.5} />
            </button>
          </div>
          <div className="relative flex-1 bg-[radial-gradient(ellipse_at_50%_40%,#2f2b27_0%,#131211_70%)]">
            <PlateViewer image={art.image} dims={shop.plateDims(shop.defaultSize, isLandscape(art))} finish="brillant" />
            <p className="label pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 text-paper/50">
              <Rotate3d className="size-4" /> Faites pivoter · molette pour zoomer
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-paper/10 px-5 py-4">
            <p className="text-[14px] text-paper/70">
              {art.artist} · dès <strong className="text-paper">{formatDH(shop.fromPrice)}</strong>
            </p>
            <Link
              href={`/oeuvre/${art.slug}`}
              onClick={close}
              className="flex items-center gap-3 bg-paper px-5 py-3 text-[13px] font-semibold uppercase tracking-wide text-ink transition-colors hover:bg-ember hover:text-white"
            >
              Choisir la taille <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
