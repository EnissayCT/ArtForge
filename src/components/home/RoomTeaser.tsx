"use client";

import { useEffect, useState } from "react";
import type { Artwork } from "@/lib/catalog";
import { isLandscape } from "@/lib/catalog";
import { SCENES } from "@/lib/media";
import { plateDims, type SizeId } from "@/lib/pricing";
import { RoomPreview } from "@/components/room/RoomPreview";
import { cn } from "@/lib/utils";

const SIZES_CYCLE: SizeId[] = ["XL", "L", "XL", "L"];

export function RoomTeaser({ arts }: { arts: Artwork[] }) {
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
        dims={plateDims(size, isLandscape(art))}
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
