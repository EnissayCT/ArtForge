"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { savePricing, type ActionState, type PricingData } from "@/app/admin/actions";
import { NO_FRAME, formatDH } from "@/lib/pricing";
import { cn } from "@/lib/utils";

type P = PricingData;
const rid = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 7)}`;

function Num({ value, onChange, label, suffix, className }: { value: number | string; onChange: (v: number) => void; label: string; suffix?: string; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11.5px] text-stone">{label}</span>
      <span className="flex items-center border border-ink/20 bg-paper focus-within:border-ink">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
          className="w-full min-w-0 bg-transparent px-2.5 py-2 text-[14px] tabular-nums outline-none"
        />
        {suffix && <span className="pr-2.5 text-[12px] text-stone">{suffix}</span>}
      </span>
    </label>
  );
}

function Text({ value, onChange, label, className, placeholder, max = 60 }: { value: string; onChange: (v: string) => void; label: string; className?: string; placeholder?: string; max?: number }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11.5px] text-stone">{label}</span>
      <input value={value} maxLength={max} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full border border-ink/20 bg-paper px-2.5 py-2 text-[14px] outline-none focus:border-ink" />
    </label>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-2 text-[13px]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-ink" /> {label}
    </label>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink/12 pt-6">
      <h2 className="display-semi text-[26px]">{title}</h2>
      {hint && <p className="mt-1 text-[13px] text-stone">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Remove({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} className="p-2 text-ember-deep hover:bg-paper-2 disabled:opacity-25" aria-label="Supprimer">
      <Trash2 className="size-4" />
    </button>
  );
}

function Add({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} className="mt-3 flex items-center gap-2 border border-dashed border-ink/30 px-3 py-2 text-[13px] font-semibold hover:border-ink">
      <Plus className="size-4" /> {label}
    </button>
  );
}

export function PricingEditor({ initial }: { initial: P }) {
  const [p, setP] = useState<P>(initial);
  const [state, setState] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState<P>(initial);
  const dirty = JSON.stringify(p) !== JSON.stringify(saved);

  const setList = <K extends "sizes" | "finishes" | "frames" | "caseTypes" | "promos">(key: K, i: number, patch: Partial<P[K][number]>) =>
    setP((s) => ({ ...s, [key]: (s[key] as P[K][number][]).map((x, n) => (n === i ? { ...x, ...patch } : x)) }));
  const removeAt = (key: "sizes" | "finishes" | "frames" | "caseTypes" | "promos", i: number) =>
    setP((s) => ({ ...s, [key]: (s[key] as unknown[]).filter((_, n) => n !== i) }));

  return (
    <div className="mt-8 space-y-10">
      <Section title="Formats des plaques" hint="Prix de la plaque seule. Le cadre s'ajoute au prix. Le format par défaut est présélectionné sur chaque fiche.">
        <ul className="space-y-3">
          {p.sizes.map((s, i) => (
            <li key={s.id} className={cn("grid grid-cols-2 gap-3 border border-ink/12 p-3 sm:grid-cols-[90px_80px_80px_110px_110px_1fr_auto]", !s.active && "opacity-60")}>
              <Text label="Nom" value={s.label} onChange={(v) => setList("sizes", i, { label: v })} max={12} />
              <Num label="Largeur" suffix="cm" value={s.w} onChange={(v) => setList("sizes", i, { w: v })} />
              <Num label="Hauteur" suffix="cm" value={s.h} onChange={(v) => setList("sizes", i, { h: v })} />
              <Num label="Prix" suffix="DH" value={s.price} onChange={(v) => setList("sizes", i, { price: v })} />
              <Num label="+ cadre" suffix="DH" value={s.framePrice} onChange={(v) => setList("sizes", i, { framePrice: v })} />
              <Text label="Badge (facultatif)" value={s.note ?? ""} onChange={(v) => setList("sizes", i, { note: v })} placeholder="Le plus choisi" max={30} className="col-span-2 sm:col-span-1" />
              <div className="col-span-2 flex items-end justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end sm:justify-end">
                <div className="flex gap-4">
                  <Toggle label="Actif" checked={s.active} onChange={(v) => setList("sizes", i, { active: v })} />
                  <label className="flex items-center gap-2 text-[13px]">
                    <input type="radio" name="defaultSize" checked={p.defaultSize === s.id} onChange={() => setP((x) => ({ ...x, defaultSize: s.id }))} className="size-4 accent-ink" />
                    Par défaut
                  </label>
                </div>
                <Remove onClick={() => removeAt("sizes", i)} disabled={p.sizes.length <= 1} />
              </div>
            </li>
          ))}
        </ul>
        <Add label="Ajouter un format" onClick={() => setP((s) => ({ ...s, sizes: [...s.sizes, { id: rid("size"), label: "", w: 50, h: 70, price: 0, framePrice: 0, note: "", active: true }] }))} />
      </Section>

      <Section title="Finitions" hint="Le supplément s'ajoute au prix du format. Le rendu sert aux aperçus et à la vue 3D.">
        <ul className="space-y-3">
          {p.finishes.map((f, i) => (
            <li key={f.id} className={cn("grid grid-cols-2 gap-3 border border-ink/12 p-3 sm:grid-cols-[1fr_1fr_110px_130px_auto]", !f.active && "opacity-60")}>
              <Text label="Nom" value={f.label} onChange={(v) => setList("finishes", i, { label: v })} max={30} />
              <Text label="Accroche" value={f.short} onChange={(v) => setList("finishes", i, { short: v })} max={40} />
              <Num label="Supplément" suffix="DH" value={f.extra} onChange={(v) => setList("finishes", i, { extra: v })} />
              <label className="block">
                <span className="mb-1 block text-[11.5px] text-stone">Rendu</span>
                <select value={f.look} onChange={(e) => setList("finishes", i, { look: e.target.value as "mat" })} className="w-full border border-ink/20 bg-paper px-2 py-2 text-[14px]">
                  <option value="mat">Mat</option>
                  <option value="brillant">Brillant</option>
                  <option value="brosse">Métal brossé</option>
                </select>
              </label>
              <div className="col-span-2 flex items-end justify-between gap-3 sm:col-span-1 sm:flex-col sm:items-end">
                <Toggle label="Actif" checked={f.active} onChange={(v) => setList("finishes", i, { active: v })} />
                <Remove onClick={() => removeAt("finishes", i)} disabled={p.finishes.length <= 1} />
              </div>
              <Text label="Description" value={f.description} onChange={(v) => setList("finishes", i, { description: v })} max={240} className="col-span-2 sm:col-span-5" />
            </li>
          ))}
        </ul>
        <Add label="Ajouter une finition" onClick={() => setP((s) => ({ ...s, finishes: [...s.finishes, { id: rid("fin"), label: "", short: "", description: "", extra: 0, look: "mat", active: true }] }))} />
      </Section>

      <Section title="Cadres" hint="Le prix du cadre dépend du format (colonne « + cadre » ci-dessus).">
        <ul className="space-y-3">
          {p.frames.map((f, i) => (
            <li key={f.id} className={cn("grid grid-cols-[1fr_auto] items-end gap-3 border border-ink/12 p-3 sm:grid-cols-[1fr_140px_auto]", !f.active && "opacity-60")}>
              <Text label="Nom" value={f.label} onChange={(v) => setList("frames", i, { label: v })} max={30} />
              {f.id === NO_FRAME ? (
                <p className="pb-2 text-[12px] text-stone sm:col-span-2">Option « sans cadre », toujours proposée</p>
              ) : (
                <>
                  <label className="block">
                    <span className="mb-1 block text-[11.5px] text-stone">Couleur</span>
                    <input type="color" value={f.color} onChange={(e) => setList("frames", i, { color: e.target.value })} className="h-[38px] w-full border border-ink/20 bg-paper p-1" />
                  </label>
                  <div className="col-span-2 flex items-center justify-between gap-3 sm:col-span-1">
                    <Toggle label="Actif" checked={f.active} onChange={(v) => setList("frames", i, { active: v })} />
                    <Remove onClick={() => removeAt("frames", i)} />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
        <Add label="Ajouter un cadre" onClick={() => setP((s) => ({ ...s, frames: [...s.frames, { id: rid("cadre"), label: "", color: "#333333", active: true }] }))} />
      </Section>

      <Section title="Coques de téléphone">
        <ul className="space-y-3">
          {p.caseTypes.map((c, i) => (
            <li key={c.id} className={cn("grid grid-cols-2 gap-3 border border-ink/12 p-3 sm:grid-cols-[1fr_110px_130px_auto]", !c.active && "opacity-60")}>
              <Text label="Nom" value={c.label} onChange={(v) => setList("caseTypes", i, { label: v })} max={30} />
              <Num label="Prix" suffix="DH" value={c.price} onChange={(v) => setList("caseTypes", i, { price: v })} />
              <label className="block">
                <span className="mb-1 block text-[11.5px] text-stone">Rendu 3D</span>
                <select value={c.style} onChange={(e) => setList("caseTypes", i, { style: e.target.value as "slim" })} className="w-full border border-ink/20 bg-paper px-2 py-2 text-[14px]">
                  <option value="slim">Fine</option>
                  <option value="antichoc">Épaisse</option>
                </select>
              </label>
              <div className="flex items-end justify-between gap-3 sm:flex-col sm:items-end">
                <Toggle label="Actif" checked={c.active} onChange={(v) => setList("caseTypes", i, { active: v })} />
                <Remove onClick={() => removeAt("caseTypes", i)} disabled={p.caseTypes.length <= 1} />
              </div>
              <Text label="Description" value={c.description} onChange={(v) => setList("caseTypes", i, { description: v })} max={200} className="col-span-2 sm:col-span-4" />
            </li>
          ))}
        </ul>
        {p.caseTypes.length < 4 && (
          <Add label="Ajouter un type de coque" onClick={() => setP((s) => ({ ...s, caseTypes: [...s.caseTypes, { id: rid("coque"), label: "", description: "", price: 0, style: "slim", active: true }] }))} />
        )}
      </Section>

      <Section title="Pack & livraison">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Num label="Remise pack dès" suffix="plaques" value={p.bundle.minPlates} onChange={(v) => setP((s) => ({ ...s, bundle: { ...s.bundle, minPlates: v } }))} />
          <Num label="Remise pack" suffix="%" value={p.bundle.percent} onChange={(v) => setP((s) => ({ ...s, bundle: { ...s.bundle, percent: v } }))} />
          <Num label="Frais de livraison" suffix="DH" value={p.shipping.price} onChange={(v) => setP((s) => ({ ...s, shipping: { ...s.shipping, price: v } }))} />
          <Num label="Livraison offerte dès" suffix="DH" value={p.shipping.freeAbove} onChange={(v) => setP((s) => ({ ...s, shipping: { ...s.shipping, freeAbove: v } }))} />
          <Num label="Délai Casa/Rabat min" suffix="j" value={p.shipping.fast[0]} onChange={(v) => setP((s) => ({ ...s, shipping: { ...s.shipping, fast: [v, s.shipping.fast[1]] } }))} />
          <Num label="Délai Casa/Rabat max" suffix="j" value={p.shipping.fast[1]} onChange={(v) => setP((s) => ({ ...s, shipping: { ...s.shipping, fast: [s.shipping.fast[0], v] } }))} />
          <Num label="Délai autres villes min" suffix="j" value={p.shipping.others[0]} onChange={(v) => setP((s) => ({ ...s, shipping: { ...s.shipping, others: [v, s.shipping.others[1]] } }))} />
          <Num label="Délai autres villes max" suffix="j" value={p.shipping.others[1]} onChange={(v) => setP((s) => ({ ...s, shipping: { ...s.shipping, others: [s.shipping.others[0], v] } }))} />
        </div>
        <p className="mt-2 text-[12px] text-stone">Mettez la remise pack à 0 % pour la désactiver. Délais en jours ouvrés, production comprise.</p>
      </Section>

      <Section title="Codes promo" hint="Les codes restent secrets côté serveur : le client ne voit que celui qu'il saisit.">
        <ul className="space-y-2">
          {p.promos.map((c, i) => (
            <li key={i} className={cn("grid grid-cols-[1fr_110px_auto] items-end gap-3", !c.active && "opacity-60")}>
              <Text label="Code" value={c.code} onChange={(v) => setList("promos", i, { code: v.toUpperCase() })} max={20} />
              <Num label="Remise" suffix="%" value={c.percent} onChange={(v) => setList("promos", i, { percent: v })} />
              <div className="flex items-center gap-2 pb-1">
                <Toggle label="Actif" checked={c.active} onChange={(v) => setList("promos", i, { active: v })} />
                <Remove onClick={() => removeAt("promos", i)} />
              </div>
            </li>
          ))}
        </ul>
        <Add label="Ajouter un code" onClick={() => setP((s) => ({ ...s, promos: [...s.promos, { code: "", percent: 10, active: true }] }))} />
      </Section>

      <div className="sticky bottom-0 z-10 -mx-4 flex flex-wrap items-center gap-4 border-t border-ink/10 bg-paper/95 px-4 py-4 backdrop-blur sm:mx-0 sm:px-0">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() =>
            start(async () => {
              const res = await savePricing(p);
              if (res?.ok) setSaved(p);
              setState(res);
            })
          }
          className="bg-ink px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-paper hover:bg-ember disabled:opacity-40"
        >
          {pending ? "Enregistrement…" : "Enregistrer les tarifs"}
        </button>
        {dirty && <p className="text-[13px] text-stone">Modifications non enregistrées</p>}
        {state?.error && <p className="text-[13px] text-ember-deep">{state.error}</p>}
        {state?.message && !dirty && <p className="text-[13px] text-ok">{state.message}</p>}
        <p className="ml-auto hidden text-[12px] text-stone md:block">
          Exemple : {p.sizes.find((s) => s.id === p.defaultSize)?.label ?? "—"} ={" "}
          {formatDH(Number(p.sizes.find((s) => s.id === p.defaultSize)?.price ?? 0))}
        </p>
      </div>
    </div>
  );
}
