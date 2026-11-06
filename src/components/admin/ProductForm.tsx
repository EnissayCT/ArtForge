"use client";

import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { ImageUp, Trash2 } from "lucide-react";
import { deleteArtwork, saveArtwork, type ActionState } from "@/app/admin/actions";
import type { Artwork, Collection } from "@/lib/catalog";

const MAX_SIDE = 3000;

/** Decodes, downsizes to ≤ 3000 px and re-encodes as JPEG in the browser; also measures size and average colour. */
async function prepareImage(file: File) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new window.Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode"));
      i.src = url;
    });
    const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale);
    const h = Math.round(img.naturalHeight * scale);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const g = c.getContext("2d")!;
    g.fillStyle = "#ffffff";
    g.fillRect(0, 0, w, h);
    g.drawImage(img, 0, 0, w, h);
    const s = document.createElement("canvas");
    s.width = 8;
    s.height = 8;
    const sg = s.getContext("2d")!;
    sg.drawImage(c, 0, 0, 8, 8);
    const px = sg.getImageData(0, 0, 8, 8).data;
    let r = 0;
    let gg = 0;
    let b = 0;
    for (let i = 0; i < px.length; i += 4) {
      r += px[i];
      gg += px[i + 1];
      b += px[i + 2];
    }
    const n = px.length / 4;
    const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
    const blob = await new Promise<Blob>((resolve, reject) => c.toBlob((bl) => (bl ? resolve(bl) : reject(new Error("encode"))), "image/jpeg", 0.9));
    return { blob, w, h, color: `#${hex(r)}${hex(gg)}${hex(b)}`, preview: URL.createObjectURL(blob), small: Math.max(img.naturalWidth, img.naturalHeight) < 1600 };
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function ProductForm({ art, collections }: { art?: Artwork; collections: Collection[] }) {
  const [prepared, setPrepared] = useState<Awaited<ReturnType<typeof prepareImage>> | null>(null);
  const blob = useRef<Blob | null>(null);
  const [state, action, pending] = useActionState<ActionState, FormData>(async (prev, fd) => {
    if (blob.current) fd.set("image", new File([blob.current], "image.jpg", { type: "image/jpeg" }));
    return saveArtwork(prev, fd);
  }, null);
  const [imgError, setImgError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const input = useRef<HTMLInputElement>(null);

  async function onFile(file?: File) {
    setImgError(null);
    if (!file) return;
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.type)) return setImgError("Utilisez une image JPG, PNG ou WebP.");
    if (file.size > 40 * 1024 * 1024) return setImgError("Image trop lourde (40 Mo max).");
    try {
      if (prepared) URL.revokeObjectURL(prepared.preview);
      const next = await prepareImage(file);
      blob.current = next.blob;
      setPrepared(next);
    } catch {
      setImgError("Image illisible.");
    }
  }

  const preview = prepared?.preview ?? art?.image;

  return (
    <form action={action} className="mt-8 grid gap-8 md:grid-cols-[minmax(0,300px)_1fr]">
      {art && <input type="hidden" name="slug" value={art.slug} />}
      <input type="hidden" name="w" value={prepared?.w ?? ""} />
      <input type="hidden" name="h" value={prepared?.h ?? ""} />
      <input type="hidden" name="color" value={prepared?.color ?? ""} />

      <div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="group relative grid aspect-[4/5] w-full place-items-center overflow-hidden border border-dashed border-ink/25 bg-paper-2 transition-colors hover:border-ink"
        >
          {preview ? (
            prepared ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="absolute inset-0 size-full object-contain p-4" />
            ) : (
              <Image src={preview} alt="" fill sizes="300px" className="object-contain p-4" />
            )
          ) : (
            <span className="flex flex-col items-center gap-2 text-[13px] text-stone">
              <ImageUp className="size-7" strokeWidth={1.4} /> Choisir l&apos;image
            </span>
          )}
          {preview && (
            <span className="label absolute bottom-2 left-1/2 -translate-x-1/2 bg-paper/90 px-2 py-1 text-[10px] opacity-0 transition-opacity group-hover:opacity-100">
              Remplacer l&apos;image
            </span>
          )}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        {imgError && <p className="mt-2 text-[12.5px] text-ember-deep">{imgError}</p>}
        {prepared && (
          <p className="mt-2 text-[12px] text-stone">
            {prepared.w} × {prepared.h} px
            {prepared.small && " — un peu juste pour les grands formats (visez 3000 px)."}
          </p>
        )}
        {!prepared && (
          <p className="mt-2 text-[12px] text-stone">Idéalement 3000 px sur le grand côté. L&apos;image est optimisée avant l&apos;envoi.</p>
        )}
      </div>

      <div className="space-y-4">
        <Field label="Titre">
          <input name="title" required maxLength={120} defaultValue={art?.title} className="field" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <Field label="Artiste">
            <input name="artist" maxLength={120} defaultValue={art?.artist} className="field" placeholder="Création originale" />
          </Field>
          <Field label="Année">
            <input name="year" maxLength={20} defaultValue={art?.year} className="field" />
          </Field>
        </div>
        <Field label="Collection">
          <select name="collection" required defaultValue={art?.collection ?? collections[0]?.slug} className="field">
            {collections.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Mots-clés (séparés par des virgules)" hint="Servent à la recherche : vague, japon, bleu…">
          <input name="tags" maxLength={400} defaultValue={art?.tags.join(", ")} className="field" />
        </Field>
        <div className="flex flex-wrap gap-6 py-1">
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" name="visible" defaultChecked={!art?.hidden} className="size-4 accent-ink" /> Visible dans la boutique
          </label>
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" name="featured" defaultChecked={!!art?.featured} className="size-4 accent-ink" /> En vedette (mise en avant)
          </label>
        </div>
        <details className="border-t border-ink/10 pt-3">
          <summary className="cursor-pointer text-[13px] font-semibold">Droits & source</summary>
          <div className="mt-3 space-y-4">
            <Field label="Lien vers la source" hint="Musée, banque d'images… pour garder une trace des droits.">
              <input name="source" type="url" maxLength={400} defaultValue={art?.source} className="field" />
            </Field>
            <Field label="Licence">
              <input name="license" maxLength={120} defaultValue={art?.license} className="field" placeholder="Domaine public, CC0, création originale…" />
            </Field>
            <p className="text-[12px] leading-relaxed text-stone">
              Ne vendez que des images dont vous avez les droits : domaine public, CC0, vos créations, ou une licence commerciale.
            </p>
          </div>
        </details>

        {state?.error && <p className="border border-ember-deep/40 bg-ember/5 p-3 text-[13px] text-ember-deep">{state.error}</p>}
        {state?.message && <p className="text-[13px] text-ok">{state.message}</p>}

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <button disabled={pending} className="bg-ink px-6 py-3 text-[13px] font-semibold uppercase tracking-[0.05em] text-paper hover:bg-ember disabled:opacity-60">
            {pending ? "Enregistrement…" : art ? "Enregistrer" : "Publier l'œuvre"}
          </button>
          {art && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                if (confirm(`Supprimer « ${art.title} » du catalogue ? Les commandes passées restent intactes.`))
                  startDelete(async () => void (await deleteArtwork(art.slug)));
              }}
              className="flex items-center gap-2 text-[13px] text-ember-deep hover:underline"
            >
              <Trash2 className="size-4" /> Supprimer
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-stone">{hint}</span>}
    </label>
  );
}
