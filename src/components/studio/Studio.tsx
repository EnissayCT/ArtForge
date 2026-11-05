"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Check,
  Crop,
  Home,
  ImageUp,
  Maximize,
  Minimize,
  RotateCw,
  Smartphone,
  Square,
  Undo2,
  Upload,
} from "lucide-react";
import { featured } from "@/lib/catalog";
import {
  DEFAULT_SIZE,
  casePrice,
  formatDH,
  getCaseType,
  getFinish,
  getFrame,
  getSize,
  platePrice,
  type CaseTypeId,
  type FinishId,
  type FrameId,
  type SizeId,
} from "@/lib/pricing";
import { DEFAULT_PHONE, getPhone } from "@/lib/phones";
import { useCart } from "@/lib/cart";
import { canvasToBlob, newId, saveDesign } from "@/lib/uploads";
import { cn } from "@/lib/utils";
import { RoomPreview } from "@/components/room/RoomPreview";
import { PhoneMockup } from "@/components/phone/PhoneMockup";
import { PlateViewer, PhoneViewer } from "@/components/viewer/lazy";
import {
  CaseTypePicker,
  FinishPicker,
  FramePicker,
  KindToggle,
  OptionLabel,
  PhonePicker,
  QtyStepper,
  SizePicker,
} from "@/components/product/Options";
import { Cropper } from "./Cropper";
import {
  INITIAL_CROP,
  averageColor,
  clampPan,
  effectiveDpi,
  qualityOf,
  renderCrop,
  sourcePxAcross,
  type CropState,
  type Natural,
  type Rotation,
} from "./crop";

type View = "cadrage" | "apercu" | "3d" | "mur";

interface Loaded {
  url: string;
  natural: Natural;
  img: HTMLImageElement;
  name: string;
  file?: File;
  avg: string;
}

const MAX_MB = 40;
const ACCEPT = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/bmp"];

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("decode"));
    img.src = url;
  });
}

export function Studio({ initialKind = "plate" }: { initialKind?: "plate" | "case" }) {
  const [kind, setKind] = useState<"plate" | "case">(initialKind);
  const [orientation, setOrientation] = useState<"portrait" | "paysage">("portrait");
  const [size, setSize] = useState<SizeId>(DEFAULT_SIZE);
  const [finish, setFinish] = useState<FinishId>("mat");
  const [frame, setFrame] = useState<FrameId>("aucun");
  const [phoneId, setPhoneId] = useState(DEFAULT_PHONE);
  const [caseType, setCaseType] = useState<CaseTypeId>("slim");
  const [qty, setQty] = useState(1);
  const [view, setView] = useState<View>("cadrage");
  const [image, setImage] = useState<Loaded | null>(null);
  const [rawCrop, setCrop] = useState<CropState>(INITIAL_CROP);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [added, setAdded] = useState(false);
  const [over, setOver] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const add = useCart((s) => s.add);

  const phone = getPhone(phoneId);
  const s = getSize(size);
  const landscape = orientation === "paysage";
  const dims = kind === "plate" ? (landscape ? { w: s.h, h: s.w } : { w: s.w, h: s.h }) : { w: phone.w / 10, h: phone.h / 10 };
  const aspect = dims.w / dims.h;
  const price = kind === "plate" ? platePrice(size, finish, frame) : casePrice(caseType);

  // keep the pan valid when the frame shape changes
  const crop = useMemo(() => (image ? clampPan(image.natural, rawCrop, aspect) : rawCrop), [image, rawCrop, aspect]);
  const dpi = image ? effectiveDpi(image.natural, crop, aspect, dims.w) : 0;
  const quality = qualityOf(dpi);


  const accept = useCallback(async (file: File) => {
    setError(null);
    if (/hei[cf]$/i.test(file.name) || file.type.includes("heic")) {
      setError("Le format HEIC n'est pas lisible par le navigateur. Sur iPhone : Réglages › Appareil photo › Formats › « Le plus compatible », ou envoyez une capture.");
      return;
    }
    if (!ACCEPT.includes(file.type)) {
      setError("Format non pris en charge. Utilisez une image JPG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Image trop lourde (max ${MAX_MB} Mo).`);
      return;
    }
    const url = URL.createObjectURL(file);
    try {
      const img = await loadImage(url);
      const natural = { w: img.naturalWidth, h: img.naturalHeight };
      if (natural.w < 300 || natural.h < 300) {
        setError("Cette image est trop petite pour être imprimée (minimum 300 × 300 px).");
        URL.revokeObjectURL(url);
        return;
      }
      setImage((prev) => {
        if (prev?.url.startsWith("blob:")) URL.revokeObjectURL(prev.url);
        return { url, natural, img, name: file.name, file, avg: averageColor(img) };
      });
      setOrientation(natural.w > natural.h * 1.08 ? "paysage" : "portrait");
      setCrop(INITIAL_CROP);
      setView("cadrage");
    } catch {
      URL.revokeObjectURL(url);
      setError("Impossible de lire cette image. Essayez un autre fichier.");
    }
  }, []);

  const trySample = useCallback(async (src: string, name: string) => {
    setError(null);
    const img = await loadImage(src);
    const natural = { w: img.naturalWidth, h: img.naturalHeight };
    setImage({ url: src, natural, img, name, avg: averageColor(img) });
    setOrientation(natural.w > natural.h * 1.08 ? "paysage" : "portrait");
    setCrop(INITIAL_CROP);
    setView("cadrage");
  }, []);

  // paste from clipboard
  useEffect(() => {
    const on = (e: ClipboardEvent) => {
      const f = [...(e.clipboardData?.files ?? [])].find((x) => x.type.startsWith("image/"));
      if (f) accept(f);
    };
    window.addEventListener("paste", on);
    return () => window.removeEventListener("paste", on);
  }, [accept]);

  // render the preview used by the 3D, wall and phone views
  const previewRef = useRef<string | null>(null);
  useEffect(() => {
    if (!image || view === "cadrage") return;
    let cancelled = false;
    const outW = 1400;
    const c = renderCrop(image.img, image.natural, crop, outW, outW / aspect);
    canvasToBlob(c, "image/jpeg", 0.9).then((b) => {
      if (cancelled) return;
      const old = previewRef.current;
      previewRef.current = URL.createObjectURL(b);
      setPreview(previewRef.current);
      // free the previous preview once every view has switched to the new one
      if (old) setTimeout(() => URL.revokeObjectURL(old), 4000);
    });
    return () => {
      cancelled = true;
    };
  }, [image, crop, aspect, view]);

  const views = useMemo(
    () =>
      (kind === "plate"
        ? [
            { id: "cadrage", label: "Cadrage", icon: Crop },
            { id: "3d", label: "Vue 3D", icon: Box },
            { id: "mur", label: "Chez vous", icon: Home },
          ]
        : [
            { id: "cadrage", label: "Cadrage", icon: Crop },
            { id: "apercu", label: "Aperçu", icon: Smartphone },
            { id: "3d", label: "Vue 3D", icon: Box },
          ]) as { id: View; label: string; icon: typeof Crop }[],
    [kind],
  );

  function switchKind(k: "plate" | "case") {
    setKind(k);
    setView("cadrage");
  }

  async function addToCart() {
    if (!image) return;
    setBusy(true);
    try {
      const across = sourcePxAcross(image.natural, crop, aspect);
      const outW = Math.round(Math.max(900, Math.min(3600, across)));
      const print = renderCrop(image.img, image.natural, crop, outW, outW / aspect);
      const printBlob = await canvasToBlob(print, "image/jpeg", 0.93);
      const thumbW = 320;
      const thumb = renderCrop(image.img, image.natural, crop, thumbW, thumbW / aspect).toDataURL("image/jpeg", 0.8);
      const id = newId();
      await saveDesign(id, { print: printBlob, original: image.file, name: image.name, createdAt: Date.now() });
      if (kind === "plate") {
        add(
          {
            kind: "plate",
            customId: id,
            title: "Création personnalisée",
            subtitle: `Plaque ${size} · ${dims.w}×${dims.h} cm · ${getFinish(finish).label}${frame !== "aucun" ? ` · ${getFrame(frame).label}` : ""}`,
            thumb,
            landscape,
            size,
            finish,
            frame,
          },
          qty,
        );
      } else {
        add(
          {
            kind: "case",
            customId: id,
            title: "Coque personnalisée",
            subtitle: `${getCaseType(caseType).label} · ${phone.name}`,
            thumb,
            phone: phone.id,
            caseType,
          },
          qty,
        );
      }
      setAdded(true);
      setTimeout(() => setAdded(false), 2400);
    } catch {
      setError("Une erreur est survenue en préparant votre fichier. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  const samples = featured(6);
  const setRot = () => setCrop((c) => clampPan(image!.natural, { ...c, rot: (((c.rot + 90) % 360) as Rotation) }, aspect));

  return (
    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* ---------------- Stage ---------------- */}
      <div className="min-w-0 lg:col-span-7 xl:col-span-8">
        <div className="lg:sticky lg:top-24">
          <div
            className={cn(
              "relative flex min-h-[420px] items-center justify-center overflow-hidden transition-colors sm:min-h-[560px]",
              view === "3d" ? "bg-[radial-gradient(ellipse_at_50%_40%,#2f2b27_0%,#131211_72%)]" : "bg-paper-2",
              view === "mur" && "block min-h-0 sm:min-h-0",
              over && "outline-2 outline-dashed outline-ember -outline-offset-8",
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setOver(true);
            }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setOver(false);
              const f = e.dataTransfer.files?.[0];
              if (f) accept(f);
            }}
          >
            {!image && (
              <div className="flex max-w-md flex-col items-center px-6 py-16 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-ink text-paper">
                  <ImageUp className="size-7" strokeWidth={1.5} />
                </div>
                <p className="display mt-6 text-[40px] sm:text-[52px]">Déposez votre image ici</p>
                <p className="mt-3 text-[14px] leading-relaxed text-stone">
                  JPG, PNG ou WebP, jusqu&apos;à {MAX_MB} Mo. Vous pouvez aussi la coller (Ctrl + V). Pour un 30 × 40 cm, visez
                  au moins 1800 × 2400 px.
                </p>
                <button
                  onClick={() => fileInput.current?.click()}
                  className="mt-7 flex items-center gap-3 bg-ink px-6 py-4 text-[13px] font-semibold uppercase tracking-[0.06em] text-paper transition-colors hover:bg-ember"
                >
                  <Upload className="size-4" /> Choisir une image
                </button>
                <div className="mt-10 w-full">
                  <p className="label mb-3 text-stone">Ou essayez avec une œuvre</p>
                  <div className="grid grid-cols-6 gap-2">
                    {samples.map((a) => (
                      <button
                        key={a.slug}
                        onClick={() => trySample(a.image, a.title)}
                        className="plate-flat relative aspect-[3/4] overflow-hidden transition-transform hover:-translate-y-1"
                        aria-label={`Essayer avec ${a.title}`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={a.image} alt="" className="absolute inset-0 size-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {image && view === "cadrage" && (
              <div className="flex w-full flex-col items-center px-6 py-10 sm:py-12">
                <div
                  className={cn("w-full", kind === "case" ? "max-w-[260px]" : "")}
                  style={kind === "plate" ? { maxWidth: `min(100%, ${aspect * 470}px)` } : undefined}
                >
                  <Cropper
                    src={image.url}
                    natural={image.natural}
                    aspect={aspect}
                    state={crop}
                    onChange={setCrop}
                    phone={kind === "case" ? phone : undefined}
                    className={kind === "plate" ? "plate" : "shadow-[0_20px_40px_-18px_rgba(0,0,0,.5)]"}
                  />
                </div>
                <p className="label mt-4 text-stone">
                  Glissez pour déplacer · molette ou pincement pour zoomer
                </p>
              </div>
            )}

            {image && view === "apercu" && kind === "case" && preview && (
              <div className="grid h-[520px] w-full place-items-center py-10">
                <PhoneMockup key={preview} image={preview} phone={phone} className="glint glint-intro h-full" />
              </div>
            )}

            {image && view === "3d" && preview && (
              <div className="absolute inset-0">
                {kind === "plate" ? (
                  <PlateViewer image={preview} dims={dims} finish={finish} frame={frame} />
                ) : (
                  <PhoneViewer image={preview} phone={phone} caseType={caseType} />
                )}
              </div>
            )}

            {image && view === "mur" && preview && (
              <RoomPreview image={preview} dims={dims} frame={frame} finish={finish} />
            )}
          </div>

          {image && (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
              <div className="no-scrollbar flex max-w-full gap-2 overflow-x-auto" role="tablist">
                {views.map((v) => (
                  <button
                    key={v.id}
                    role="tab"
                    aria-selected={view === v.id}
                    onClick={() => setView(v.id)}
                    className={cn(
                      "flex shrink-0 items-center gap-2 whitespace-nowrap border px-3.5 py-2 text-[13px] font-medium transition-colors",
                      view === v.id ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink/50",
                    )}
                  >
                    <v.icon className="size-4" strokeWidth={1.5} />
                    {v.label}
                  </button>
                ))}
              </div>
              {view === "cadrage" && (
                <div className="flex flex-wrap items-center gap-2">
                  <label className="flex items-center gap-2 text-[13px]">
                    <span className="text-stone">Zoom</span>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={0.01}
                      value={crop.zoom}
                      onChange={(e) => setCrop((c) => clampPan(image.natural, { ...c, zoom: Number(e.target.value) }, aspect))}
                      className="w-28 accent-ink"
                    />
                  </label>
                  <button onClick={setRot} className="grid size-9 place-items-center border border-ink/15 hover:border-ink" aria-label="Pivoter de 90°">
                    <RotateCw className="size-4" strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={() =>
                      setCrop((c) =>
                        clampPan(image.natural, { ...c, mode: c.mode === "fill" ? "fit" : "fill", zoom: 1, bg: c.mode === "fill" ? image.avg : c.bg }, aspect),
                      )
                    }
                    className="flex h-9 items-center gap-2 border border-ink/15 px-3 text-[13px] hover:border-ink"
                  >
                    {crop.mode === "fill" ? <Minimize className="size-4" strokeWidth={1.5} /> : <Maximize className="size-4" strokeWidth={1.5} />}
                    {crop.mode === "fill" ? "Image entière" : "Remplir"}
                  </button>
                  <button onClick={() => setCrop({ ...INITIAL_CROP, bg: crop.bg, mode: crop.mode })} className="grid size-9 place-items-center border border-ink/15 hover:border-ink" aria-label="Réinitialiser le cadrage">
                    <Undo2 className="size-4" strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>
          )}
          {image && view === "cadrage" && crop.mode === "fit" && (
            <div className="mt-3 flex items-center gap-2 text-[13px]">
              <span className="text-stone">Fond</span>
              {[image.avg, "#ffffff", "#f1eee8", "#131211", "#c2441f"].map((c) => (
                <button
                  key={c}
                  onClick={() => setCrop((s) => ({ ...s, bg: c }))}
                  className={cn("size-7 rounded-full border border-ink/20", crop.bg === c && "ring-2 ring-ink ring-offset-2 ring-offset-paper")}
                  style={{ background: c }}
                  aria-label={`Fond ${c}`}
                />
              ))}
              <input
                type="color"
                value={crop.bg}
                onChange={(e) => setCrop((s) => ({ ...s, bg: e.target.value }))}
                className="size-7 cursor-pointer rounded-full border-0 bg-transparent p-0"
                aria-label="Couleur personnalisée"
              />
            </div>
          )}
        </div>
      </div>

      {/* ---------------- Panel ---------------- */}
      <div className="min-w-0 lg:col-span-5 xl:col-span-4">
        <div className="space-y-8">
          <div>
            <p className="label mb-3 text-stone">01 — Support</p>
            <KindToggle value={kind} onChange={switchKind} />
          </div>

          <div>
            <p className="label mb-3 text-stone">02 — Votre image</p>
            {image ? (
              <div className="border border-ink/12 p-4">
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.url} alt="" className="size-12 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[14px] font-semibold">{image.name}</p>
                    <p className="text-[12px] text-stone">
                      {image.natural.w} × {image.natural.h} px
                    </p>
                  </div>
                  <button onClick={() => fileInput.current?.click()} className="label link-u shrink-0">
                    Changer
                  </button>
                </div>
                <div className="mt-4">
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span>
                      Qualité d&apos;impression : <strong>{quality.label}</strong>
                    </span>
                    <span className="label text-stone">{Math.round(dpi)} dpi</span>
                  </div>
                  <div className="mt-2 grid grid-cols-4 gap-1">
                    {[0, 1, 2, 3].map((n) => (
                      <div
                        key={n}
                        className={cn(
                          "h-1.5",
                          n <= quality.level
                            ? quality.level >= 2
                              ? "bg-ok"
                              : quality.level === 1
                                ? "bg-brass"
                                : "bg-ember"
                            : "bg-ink/10",
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-[12.5px] text-stone">{quality.hint}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={() => fileInput.current?.click()}
                className="flex w-full items-center justify-between border border-dashed border-ink/30 px-4 py-5 text-left transition-colors hover:border-ink"
              >
                <span>
                  <span className="block text-[14px] font-semibold">Importer une image</span>
                  <span className="text-[12.5px] text-stone">Photo, dessin, logo… depuis votre téléphone ou ordinateur</span>
                </span>
                <Upload className="size-5" strokeWidth={1.5} />
              </button>
            )}
            {error && <p className="mt-3 text-[13px] leading-relaxed text-ember-deep">{error}</p>}
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) accept(f);
                e.target.value = "";
              }}
            />
          </div>

          <div>
          <p className="label mb-3 text-stone">03 — Format</p>
          <div className="space-y-7">
            {kind === "plate" ? (
              <>
                <div>
                  <OptionLabel title="Orientation" />
                  <div className="grid grid-cols-2 gap-2">
                    {(["portrait", "paysage"] as const).map((o) => (
                      <button
                        key={o}
                        onClick={() => setOrientation(o)}
                        className={cn(
                          "flex items-center justify-center gap-2 border py-2.5 text-[13px] font-medium capitalize transition-colors",
                          orientation === o ? "border-ink" : "border-ink/15 hover:border-ink/50",
                        )}
                      >
                        <Square className={cn("size-4", o === "portrait" ? "scale-x-75" : "scale-y-75")} strokeWidth={1.5} />
                        {o}
                      </button>
                    ))}
                  </div>
                </div>
                <SizePicker value={size} onChange={setSize} landscape={landscape} />
                <FinishPicker value={finish} onChange={setFinish} />
                <FramePicker value={frame} onChange={setFrame} size={size} />
              </>
            ) : (
              <>
                <PhonePicker value={phoneId} onChange={setPhoneId} />
                <CaseTypePicker value={caseType} onChange={setCaseType} />
              </>
            )}
          </div>
          </div>

          <div className="border-t border-ink/12 pt-6">
            <div className="flex items-baseline justify-between">
              <p className="text-[14px] text-stone">Total</p>
              <p className="text-[28px] font-semibold tabular-nums">{formatDH(price * qty)}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <QtyStepper value={qty} onChange={setQty} />
              <button
                onClick={addToCart}
                disabled={!image || busy}
                className={cn(
                  "flex h-[54px] flex-1 items-center justify-center gap-3 text-[14px] font-semibold uppercase tracking-[0.06em] transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  added ? "bg-ok text-white" : "bg-ink text-paper hover:bg-ember",
                )}
              >
                {added ? (
                  <>
                    <Check className="size-4" /> Ajouté au panier
                  </>
                ) : busy ? (
                  "Préparation du fichier…"
                ) : image ? (
                  "Ajouter au panier"
                ) : (
                  "Importez d'abord une image"
                )}
              </button>
            </div>
            {image && quality.level === 0 && (
              <p className="mt-3 text-[12.5px] text-ember-deep">
                Vous pouvez commander quand même : nous vous contacterons avant impression si le rendu risque d&apos;être flou.
              </p>
            )}
            <p className="mt-4 text-[12.5px] leading-relaxed text-stone">
              Chaque fichier est vérifié par l&apos;atelier avant impression. Paiement à la livraison.{" "}
              <Link href="/aide#creations" className="underline">
                Droits d&apos;image
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
