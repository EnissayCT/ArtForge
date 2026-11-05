import Image from "next/image";
import type { Artwork } from "@/lib/catalog";
import { SIZES, formatDH } from "@/lib/pricing";

/** The four formats drawn to the same scale, next to a 1 m ruler. */
export function SizesToScale({ art }: { art: Artwork }) {
  return (
    <div className="relative">
      <div className="flex items-end gap-[3.5%] border-b border-ink/25 pb-0">
        {SIZES.map((s) => (
          <div key={s.id} className="flex flex-col items-center" style={{ width: `${(s.w / 200) * 100}%` }}>
            <div
              className="glint plate relative w-full overflow-hidden transition-transform duration-700 hover:-translate-y-1"
              style={{ aspectRatio: `${s.w} / ${s.h}`, backgroundColor: art.color }}
            >
              <Image src={art.image} alt="" fill sizes="25vw" className="object-cover" />
            </div>
            <div className="h-4" />
          </div>
        ))}
        <div className="ml-auto flex flex-col items-center" style={{ width: `${(3 / 200) * 100}%` }} aria-hidden="true">
          <span className="label mb-1 text-[9px] text-stone">1 m</span>
          <div className="relative w-full border-l border-ink/40" style={{ aspectRatio: "3 / 100" }}>
            {Array.from({ length: 11 }).map((_, n) => (
              <span key={n} className="absolute left-0 h-px bg-ink/45" style={{ bottom: `${n * 10}%`, width: n % 5 === 0 ? "100%" : "55%" }} />
            ))}
          </div>
          <div className="h-4" />
        </div>
      </div>
      <div className="mt-4 flex gap-[3.5%]">
        {SIZES.map((s) => (
          <div key={s.id} style={{ width: `${(s.w / 200) * 100}%` }} className="min-w-0">
            <p className="display-semi text-[22px] sm:text-[28px]">{s.label}</p>
            <p className="text-[12px] text-stone sm:text-[13px]">
              {s.w} × {s.h} cm
            </p>
            <p className="mt-1 text-[13px] font-semibold tabular-nums sm:text-[15px]">{formatDH(s.price)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
