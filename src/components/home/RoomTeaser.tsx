"use client";

import { useEffect, useState } from "react";
import type { Artwork } from "@/lib/catalog";
import { isLandscape } from "@/lib/catalog";
import { SCENES } from "@/lib/media";
import { useShop } from "@/components/providers/ShopProvider";
import { RoomPreview } from "@/components/room/RoomPreview";
import { cn } from "@/lib/utils";

export function RoomTeaser({ arts }: { arts: Artwork[] }) {
  const shop = useShop();
  const big = [...shop.sizes].sort((a, b) => b.w * b.h - a.w * a.h).slice(0, 2).map((x) => x.id);
  const SIZES_CYCLE = big.length ? [big[0], big[1] ?? big[0]] : [shop.defaultSize];
  const [i, setI] = useState(0);
  const [scene, setScene] = useState(SCENES[0]?.id);
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % arts.length), 3200);
    return () => clearInterval(t);
  }, [arts.length]);
  const art = arts[i];
  if (!art) return null;
  const size = SIZES_CYCLE[i % SIZES_CYCLE.length];
  return (
    <div>
      <RoomPreview
        image={art.image}
        dims={shop.plateDims(size, isLandscape(art))}
        sceneId={scene}
        onSceneChange={setScene}
        controls={false}
        draggable={false}
        sizesLabel
      />
      <div className="mt-3 flex flex-wrap gap-2">
        {SCENES.map((s) => (
          <button
            key={s.id}
            onClick={() => setScene(s.id)}
            className={cn(
              "label px-2.5 py-1.5 text-[10px] transition-colors",
              scene === s.id ? "bg-ink text-paper" : "bg-paper text-ink/70 hover:text-ink",
            )}
          >
            {s.name}
          </button>
        ))}
      </div>
    </div>
  );
}
