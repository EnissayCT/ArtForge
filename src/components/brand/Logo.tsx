import { useId } from "react";
import { cn } from "@/lib/utils";

/**
 * The ArtForge mark: a metal plate with a chamfered corner, crossed by the
 * double glint of light that runs over polished metal.
 */
export function Mark({ className, animated = false }: { className?: string; animated?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 30 40" className={cn("block", className)} aria-hidden="true">
      <defs>
        <mask id={`m${id}`}>
          <path d="M0 1.2A1.2 1.2 0 0 1 1.2 0H25l5 5v33.8a1.2 1.2 0 0 1-1.2 1.2H1.2A1.2 1.2 0 0 1 0 38.8Z" fill="#fff" />
          <g className={animated ? "af-mark-glint" : undefined}>
            <path d="M-2 29.6 32 6.2v5.4L-2 35Z" fill="#000" />
            <path d="M-2 38.4 32 15v1.9L-2 40.3Z" fill="#000" />
          </g>
        </mask>
      </defs>
      <rect width="30" height="40" fill="currentColor" mask={`url(#m${id})`} />
    </svg>
  );
}

export function Logo({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5 group/logo", className)}>
      <Mark animated className={cn("h-[26px] w-auto", markClassName)} />
      <span
        className="font-sans text-[23px] font-extrabold uppercase leading-none tracking-[0.02em]"
        style={{ fontStretch: "62%" }}
      >
        Art<span className="tracking-[0.02em]">Forge</span>
      </span>
    </span>
  );
}
