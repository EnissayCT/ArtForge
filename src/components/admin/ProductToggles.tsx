"use client";

import { useOptimistic, useTransition } from "react";
import { Eye, EyeOff, Star } from "lucide-react";
import { toggleArtwork } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

export function ProductToggles({ slug, featured, hidden }: { slug: string; featured: boolean; hidden: boolean }) {
  const [pending, start] = useTransition();
  const [state, setState] = useOptimistic({ featured, hidden });
  const flip = (field: "featured" | "hidden") =>
    start(async () => {
      setState((s) => ({ ...s, [field]: !s[field] }));
      await toggleArtwork(slug, field, !state[field]);
    });
  return (
    <div className="mt-2 flex gap-1.5">
      <button
        type="button"
        onClick={() => flip("featured")}
        disabled={pending}
        aria-pressed={state.featured}
        className={cn(
          "flex items-center gap-1 border px-2 py-1 text-[11.5px] transition-colors",
          state.featured ? "border-brass bg-brass/15 font-semibold" : "border-ink/15 text-stone hover:border-ink/50",
        )}
      >
        <Star className={cn("size-3", state.featured && "fill-current")} /> Vedette
      </button>
      <button
        type="button"
        onClick={() => flip("hidden")}
        disabled={pending}
        aria-pressed={!state.hidden}
        className={cn(
          "flex items-center gap-1 border px-2 py-1 text-[11.5px] transition-colors",
          state.hidden ? "border-ink/15 text-stone" : "border-ink/15 hover:border-ink/50",
        )}
      >
        {state.hidden ? <EyeOff className="size-3" /> : <Eye className="size-3" />} {state.hidden ? "Masquée" : "Visible"}
      </button>
    </div>
  );
}
