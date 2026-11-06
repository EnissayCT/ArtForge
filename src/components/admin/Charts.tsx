"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Single-series column chart: thin columns (≤ 24px) with 4px rounded tops,
 * square at the baseline, hairline baseline, hover tooltip, table view.
 */
export function Columns({
  title,
  data,
  tone = "ink",
  format = (n: number) => String(n),
}: {
  title: string;
  data: { label: string; short: string; value: number }[];
  tone?: "ink" | "ember";
  format?: (n: number) => string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.value));
  const total = data.reduce((s, d) => s + d.value, 0);
  const peak = data.reduce((best, d, i) => (d.value > data[best].value ? i : best), 0);
  const shown = hover ?? null;

  return (
    <figure className="border border-ink/12 bg-paper p-4 sm:p-5">
      <figcaption className="flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-semibold">{title}</span>
        <span className="text-[13px] tabular-nums text-stone">
          {shown !== null ? (
            <>
              {data[shown].label} · <strong className="text-ink">{format(data[shown].value)}</strong>
            </>
          ) : (
            <>
              Total <strong className="text-ink">{format(total)}</strong>
            </>
          )}
        </span>
      </figcaption>
      <div className="relative mt-4 h-[120px]" onMouseLeave={() => setHover(null)}>
        <span className="label absolute -top-1 left-0 text-[10px] text-stone">{format(max)}</span>
        <div className="absolute inset-x-0 bottom-0 top-3 flex items-end gap-[2px] border-b border-ink/15">
          {data.map((d, i) => (
            <button
              key={d.label}
              type="button"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              onClick={() => setHover(i)}
              aria-label={`${d.label} : ${format(d.value)}`}
              className="group flex h-full flex-1 items-end justify-center outline-none"
            >
              <span
                className={cn(
                  "block w-full max-w-[24px] rounded-t-[4px] transition-opacity",
                  tone === "ember" ? "bg-ember" : "bg-ink",
                  hover !== null && hover !== i ? "opacity-35" : "opacity-100",
                  d.value === 0 && "opacity-0",
                )}
                style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value ? 3 : 0 }}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-stone">
        <span>{data[0]?.short}</span>
        {data[peak]?.value > 0 && <span className="hidden sm:inline">pic : {data[peak].short}</span>}
        <span>{data[data.length - 1]?.short}</span>
      </div>
      <details className="mt-2 text-[12px]">
        <summary className="cursor-pointer text-stone hover:text-ink">Voir le tableau</summary>
        <table className="mt-2 w-full tabular-nums">
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-ink/8">
                <td className="py-1 text-stone">{d.label}</td>
                <td className="py-1 text-right">{format(d.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Horizontal funnel: one series, values at the bar tips, step conversion as text. */
export function Funnel({ steps }: { steps: { label: string; value: number }[] }) {
  const max = Math.max(1, ...steps.map((s) => s.value));
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const prev = i > 0 ? steps[i - 1].value : null;
        const rate = prev ? Math.round((s.value / prev) * 1000) / 10 : null;
        return (
          <li key={s.label} className="grid grid-cols-[minmax(0,7.5rem)_1fr] items-center gap-3 sm:grid-cols-[10rem_1fr]">
            <span className="truncate text-[13px]">{s.label}</span>
            <span className="flex min-w-0 items-center gap-2">
              <span
                className={cn("block h-[14px] rounded-r-[4px]", i === steps.length - 1 ? "bg-ember" : "bg-ink")}
                style={{ width: `${Math.max(s.value ? 1.5 : 0, (s.value / max) * 78)}%` }}
              />
              <span className="shrink-0 text-[13px] font-semibold tabular-nums">{s.value}</span>
              {rate !== null && <span className="shrink-0 text-[12px] tabular-nums text-stone">{rate} %</span>}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
