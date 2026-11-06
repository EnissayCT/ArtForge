"use client";

import { useState, useTransition } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { saveCollections, type ActionState } from "@/app/admin/actions";
import type { Collection } from "@/lib/catalog";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

export function CollectionsEditor({ initial, counts }: { initial: Collection[]; counts: Record<string, number> }) {
  const [list, setList] = useState(initial);
  const [isNew, setIsNew] = useState<Set<string>>(new Set());
  const [state, setState] = useState<ActionState>(null);
  const [pending, start] = useTransition();
  const [saved, setSaved] = useState(initial);
  const dirty = JSON.stringify(list) !== JSON.stringify(saved);

  const update = (i: number, patch: Partial<Collection>) =>
    setList((l) =>
      l.map((c, n) => {
        if (n !== i) return c;
        const next = { ...c, ...patch };
        // a brand-new collection follows its name until saved
        if (patch.name !== undefined && isNew.has(c.slug)) {
          let s = slugify(patch.name) || c.slug;
          for (let k = 2; l.some((x, m) => m !== i && x.slug === s); k++) s = `${slugify(patch.name)}-${k}`;
          setIsNew((set) => new Set([...[...set].filter((x) => x !== c.slug), s]));
          next.slug = s;
        }
        return next;
      }),
    );
  const move = (i: number, d: number) =>
    setList((l) => {
      const j = i + d;
      if (j < 0 || j >= l.length) return l;
      const copy = [...l];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  return (
    <div className="mt-8">
      <ol className="space-y-4">
        {list.map((c, i) => (
          <li key={i} className="border border-ink/12 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="label text-stone">
                {String(i + 1).padStart(2, "0")} · /{c.slug} · {counts[c.slug] ?? 0} œuvre{(counts[c.slug] ?? 0) > 1 ? "s" : ""}
              </p>
              <div className="flex gap-1">
                <button type="button" onClick={() => move(i, -1)} className="p-1.5 hover:bg-paper-2" aria-label="Monter">
                  <ArrowUp className="size-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} className="p-1.5 hover:bg-paper-2" aria-label="Descendre">
                  <ArrowDown className="size-4" />
                </button>
                <button
                  type="button"
                  disabled={(counts[c.slug] ?? 0) > 0}
                  title={(counts[c.slug] ?? 0) > 0 ? "Déplacez ou supprimez d'abord ses œuvres" : "Supprimer"}
                  onClick={() => setList((l) => l.filter((_, n) => n !== i))}
                  className="p-1.5 text-ember-deep hover:bg-paper-2 disabled:opacity-25"
                  aria-label="Supprimer"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input value={c.name} onChange={(e) => update(i, { name: e.target.value })} placeholder="Nom" maxLength={40} className="field" aria-label="Nom" />
              <input value={c.kicker} onChange={(e) => update(i, { kicker: e.target.value })} placeholder="Sur-titre (ex. Ukiyo-e)" maxLength={40} className="field" aria-label="Sur-titre" />
              <textarea
                value={c.description}
                onChange={(e) => update(i, { description: e.target.value })}
                placeholder="Description"
                maxLength={400}
                rows={2}
                className="field resize-y sm:col-span-2"
                aria-label="Description"
              />
            </div>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={() => {
          const slug = `nouvelle-${list.length + 1}`;
          setIsNew((s) => new Set([...s, slug]));
          setList((l) => [...l, { slug, name: "", kicker: "", description: "" }]);
        }}
        className="mt-4 flex items-center gap-2 border border-dashed border-ink/30 px-4 py-2.5 text-[13px] font-semibold hover:border-ink"
      >
        <Plus className="size-4" /> Nouvelle collection
      </button>

      <div className="sticky bottom-0 mt-8 flex flex-wrap items-center gap-4 border-t border-ink/10 bg-paper/95 py-4">
        <button
          type="button"
          disabled={pending || !dirty}
          onClick={() =>
            start(async () => {
              const res = await saveCollections(list);
              if (res?.ok) setSaved(list);
              setState(res);
            })
          }
          className="bg-ink px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-paper hover:bg-ember disabled:opacity-40"
        >
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        {state?.error && <p className="text-[13px] text-ember-deep">{state.error}</p>}
        {state?.message && !dirty && <p className="text-[13px] text-ok">{state.message}</p>}
      </div>
    </div>
  );
}
