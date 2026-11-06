"use client";

import { ChevronDown } from "lucide-react";
import { NO_FRAME, formatDH, type CaseTypeId, type FinishId, type FrameId, type SizeId } from "@/lib/pricing";
import { useShop } from "@/components/providers/ShopProvider";
import { cn } from "@/lib/utils";

export function OptionLabel({ title, value, aside }: { title: string; value?: string; aside?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-baseline justify-between gap-3">
      <p className="text-[13px]">
        <span className="font-semibold">{title}</span>
        {value && <span className="text-stone"> — {value}</span>}
      </p>
      {aside}
    </div>
  );
}

export function KindToggle({ value, onChange }: { value: "plate" | "case"; onChange: (v: "plate" | "case") => void }) {
  return (
    <div className="grid grid-cols-2 border border-ink/15 p-1" role="tablist" aria-label="Support">
      {(
        [
          ["plate", "Plaque métal"],
          ["case", "Coque de téléphone"],
        ] as const
      ).map(([id, label]) => (
        <button
          key={id}
          role="tab"
          aria-selected={value === id}
          onClick={() => onChange(id)}
          className={cn(
            "py-2.5 text-[13px] font-semibold uppercase tracking-[0.04em] transition-colors",
            value === id ? "bg-ink text-paper" : "text-ink/70 hover:text-ink",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function SizePicker({
  value,
  onChange,
  landscape,
}: {
  value: SizeId;
  onChange: (v: SizeId) => void;
  landscape?: boolean;
}) {
  const shop = useShop();
  const s = shop.size(value);
  const tallest = Math.max(...shop.sizes.map((x) => Math.max(x.w, x.h)), 1);
  return (
    <div>
      <OptionLabel
        title="Format"
        value={landscape ? `${s.h} × ${s.w} cm` : `${s.w} × ${s.h} cm`}
        aside={
          <a href="/aide#tailles" className="label link-u text-stone">
            Guide des tailles
          </a>
        }
      />
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${Math.min(Math.max(shop.sizes.length, 1), 4)}, minmax(0, 1fr))` }}
        role="radiogroup"
        aria-label="Format"
      >
        {shop.sizes.map((size) => {
          const active = size.id === value;
          // drawn to scale: the largest size is the reference
          const scale = Math.max(size.w, size.h) / tallest;
          return (
            <button
              key={size.id}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(size.id)}
              className={cn(
                "relative flex flex-col items-center border px-1 pb-2.5 pt-3 transition-colors",
                active ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink/50",
              )}
            >
              {size.note && (
                <span
                  className={cn(
                    "label absolute -top-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-1.5 text-[8.5px]",
                    active ? "bg-ember text-white" : "bg-paper text-ember-deep",
                  )}
                >
                  {size.note}
                </span>
              )}
              <span className="flex h-9 items-end">
                <span
                  className={cn("block border", active ? "border-paper/80 bg-paper/15" : "border-ink/50 bg-ink/5")}
                  style={
                    landscape
                      ? { width: `${36 * scale}px`, height: `${24 * scale}px` }
                      : { width: `${24 * scale}px`, height: `${36 * scale}px` }
                  }
                />
              </span>
              <span className="display-semi mt-2 text-[18px]">{size.label}</span>
              <span className={cn("text-[11px]", active ? "text-paper/70" : "text-stone")}>
                {landscape ? `${size.h}×${size.w}` : `${size.w}×${size.h}`}
              </span>
              <span className="mt-1 text-[12px] font-semibold tabular-nums">{formatDH(size.price)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function FinishPicker({ value, onChange }: { value: FinishId; onChange: (v: FinishId) => void }) {
  const shop = useShop();
  const f = shop.finish(value);
  if (!f) return null;
  return (
    <div>
      <OptionLabel title="Finition" value={f.label} />
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Finition">
        {shop.finishes.map((finish) => {
          const active = finish.id === value;
          return (
            <button
              key={finish.id}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(finish.id)}
              className={cn(
                "flex flex-col items-start border px-3 py-2.5 text-left transition-colors",
                active ? "border-ink" : "border-ink/15 hover:border-ink/50",
              )}
            >
              <span className="flex w-full items-center justify-between gap-1">
                <span className="text-[13px] font-semibold">{finish.label}</span>
                <span
                  className="size-3.5 shrink-0 rounded-full border border-ink/20"
                  style={{
                    background:
                      finish.look === "brillant"
                        ? "radial-gradient(circle at 30% 30%, #fff 0 18%, #3a3632 60%)"
                        : finish.look === "brosse"
                          ? "repeating-linear-gradient(90deg,#c9ccd1 0 1px,#a7abb1 1px 2px)"
                          : "#4a4540",
                  }}
                />
              </span>
              <span className="mt-0.5 text-[11.5px] leading-snug text-stone">
                {finish.extra ? `+${formatDH(finish.extra)}` : finish.short}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-[12.5px] leading-relaxed text-stone">{f.description}</p>
    </div>
  );
}

export function FramePicker({ value, onChange, size }: { value: FrameId; onChange: (v: FrameId) => void; size: SizeId }) {
  const shop = useShop();
  const s = shop.size(size);
  if (shop.frames.length < 2) return null;
  return (
    <div>
      <OptionLabel title="Cadre" value={shop.frames.find((f) => f.id === value)?.label} />
      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Cadre">
        {shop.frames.map((frame) => {
          const active = frame.id === value;
          return (
            <button
              key={frame.id}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(frame.id)}
              className={cn(
                "flex items-center gap-2 border py-2 pl-2 pr-3 text-[13px] transition-colors",
                active ? "border-ink" : "border-ink/15 hover:border-ink/50",
              )}
            >
              <span
                className="grid size-5 place-items-center border"
                style={{
                  borderColor: frame.id === NO_FRAME ? "rgba(19,18,17,.25)" : frame.color,
                  borderWidth: frame.id === NO_FRAME ? 1 : 4,
                  borderStyle: frame.id === NO_FRAME ? "dashed" : "solid",
                }}
              />
              <span className="font-medium">{frame.label}</span>
              {frame.id !== NO_FRAME && <span className="text-stone">+{formatDH(s.framePrice)}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function PhonePicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const shop = useShop();
  const phone = shop.phone(value);
  return (
    <div>
      <OptionLabel title="Téléphone" value={phone.name} />
      <div className="mb-2 flex gap-1">
        {shop.brands.map((b) => (
          <button
            key={b}
            onClick={() => onChange(shop.phones.find((p) => p.brand === b)!.id)}
            className={cn(
              "px-3 py-1.5 text-[13px] font-medium transition-colors",
              phone.brand === b ? "bg-ink text-paper" : "bg-paper-2 hover:bg-paper-3",
            )}
          >
            {b}
          </button>
        ))}
      </div>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="field appearance-none pr-10"
          aria-label="Modèle de téléphone"
        >
          {shop.phones.filter((p) => p.brand === phone.brand).map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2" />
      </div>
      <p className="mt-2 text-[12.5px] text-stone">
        Votre modèle n&apos;est pas listé ? Écrivez-nous sur WhatsApp, on l&apos;ajoute.
      </p>
    </div>
  );
}

export function CaseTypePicker({ value, onChange }: { value: CaseTypeId; onChange: (v: CaseTypeId) => void }) {
  const shop = useShop();
  return (
    <div>
      <OptionLabel title="Type de coque" />
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de coque">
        {shop.caseTypes.map((c) => {
          const active = c.id === value;
          return (
            <button
              key={c.id}
              role="radio"
              aria-checked={active}
              onClick={() => onChange(c.id)}
              className={cn(
                "flex flex-col items-start border px-3 py-3 text-left transition-colors",
                active ? "border-ink" : "border-ink/15 hover:border-ink/50",
              )}
            >
              <span className="flex w-full items-baseline justify-between">
                <span className="text-[14px] font-semibold">{c.label}</span>
                <span className="text-[13px] font-semibold tabular-nums">{formatDH(c.price)}</span>
              </span>
              <span className="mt-1 text-[12px] leading-snug text-stone">{c.description}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function QtyStepper({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex h-[54px] items-center border border-ink/20">
      <button onClick={() => onChange(Math.max(1, value - 1))} className="h-full w-11 text-lg" aria-label="Moins">
        −
      </button>
      <span className="w-6 text-center text-[15px] font-semibold tabular-nums">{value}</span>
      <button onClick={() => onChange(Math.min(20, value + 1))} className="h-full w-11 text-lg" aria-label="Plus">
        +
      </button>
    </div>
  );
}
