"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { Banknote, Box, Check, Heart, Home, Magnet, RotateCcw, Scan, Square } from "lucide-react";
import type { Artwork, Collection } from "@/lib/catalog";
import { isLandscape } from "@/lib/catalog";
import {
  DEFAULT_SIZE,
  casePrice,
  formatDH,
  getCaseType,
  getFinish,
  getFrame,
  plateDims,
  platePrice,
  type CaseTypeId,
  type FinishId,
  type FrameId,
  type SizeId,
} from "@/lib/pricing";
import { DEFAULT_PHONE, getPhone } from "@/lib/phones";
import { useCart } from "@/lib/cart";
import { useWishlist } from "@/lib/wishlist";
import { useHydrated } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import { RoomPreview } from "@/components/room/RoomPreview";
import { PhoneMockup } from "@/components/phone/PhoneMockup";
import { PlateViewer, PhoneViewer } from "@/components/viewer/lazy";
import { Accordion } from "@/components/ui/Accordion";
import {
  CaseTypePicker,
  FinishPicker,
  FramePicker,
  KindToggle,
  PhonePicker,
  QtyStepper,
  SizePicker,
} from "./Options";
import { DeliveryEstimate } from "./Delivery";

type View = "apercu" | "3d" | "mur" | "detail";

export function ProductView({
  art,
  collection,
  initialKind = "plate",
}: {
  art: Artwork;
  collection?: Collection;
  initialKind?: "plate" | "case";
}) {
  const landscape = isLandscape(art);
  const [kind, setKind] = useState<"plate" | "case">(initialKind);
  const [view, setView] = useState<View>("apercu");
  const [size, setSize] = useState<SizeId>(DEFAULT_SIZE);
  const [finish, setFinish] = useState<FinishId>("mat");
  const [frame, setFrame] = useState<FrameId>("aucun");
  const [phoneId, setPhoneId] = useState(DEFAULT_PHONE);
  const [caseType, setCaseType] = useState<CaseTypeId>("slim");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const addTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const add = useCart((s) => s.add);
  const hydrated = useHydrated();
  const liked = useWishlist((s) => s.slugs.includes(art.slug));
  const toggleLike = useWishlist((s) => s.toggle);

  const dims = plateDims(size, landscape);
  const phone = getPhone(phoneId);
  const price = kind === "plate" ? platePrice(size, finish, frame) : casePrice(caseType);

  const views: { id: View; label: string; icon: React.ReactNode }[] =
    kind === "plate"
      ? [
          { id: "apercu", label: "Aperçu", icon: <Square className="size-4" strokeWidth={1.5} /> },
          { id: "3d", label: "Vue 3D", icon: <Box className="size-4" strokeWidth={1.5} /> },
          { id: "mur", label: "Chez vous", icon: <Home className="size-4" strokeWidth={1.5} /> },
          { id: "detail", label: "Détail", icon: <Scan className="size-4" strokeWidth={1.5} /> },
        ]
      : [
          { id: "apercu", label: "Aperçu", icon: <Square className="size-4" strokeWidth={1.5} /> },
          { id: "3d", label: "Vue 3D", icon: <Box className="size-4" strokeWidth={1.5} /> },
        ];

  function switchKind(k: "plate" | "case") {
    setKind(k);
    if (k === "case" && (view === "mur" || view === "detail")) setView("apercu");
  }

  function addToCart() {
    if (kind === "plate") {
      add(
        {
          kind: "plate",
          artSlug: art.slug,
          title: art.title,
          subtitle: `Plaque ${size} · ${dims.w}×${dims.h} cm · ${getFinish(finish).label}${frame !== "aucun" ? ` · ${getFrame(frame).label}` : ""}`,
          thumb: art.image,
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
          artSlug: art.slug,
          title: art.title,
          subtitle: `Coque ${getCaseType(caseType).label} · ${phone.name}`,
          thumb: art.image,
          phone: phone.id,
          caseType,
        },
        qty,
      );
    }
    setAdded(true);
    clearTimeout(addTimer.current);
    addTimer.current = setTimeout(() => setAdded(false), 2200);
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 pb-10 pt-5 sm:px-8">
      <nav className="label mb-5 flex flex-wrap gap-x-2 text-stone" aria-label="Fil d'Ariane">
        <Link href="/boutique" className="hover:text-ink">Boutique</Link>
        <span>/</span>
        {collection && (
          <>
            <Link href={`/collections/${collection.slug}`} className="hover:text-ink">{collection.name}</Link>
            <span>/</span>
          </>
        )}
        <span className="text-ink">{art.title}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
        {/* ------- Stage ------- */}
        <div className="min-w-0 lg:col-span-7 xl:col-span-8">
          <div className="lg:sticky lg:top-24">
            <div
              className={cn(
                "relative overflow-hidden",
                view === "3d" ? "bg-[radial-gradient(ellipse_at_50%_40%,#2f2b27_0%,#131211_72%)]" : "bg-paper-2",
                view === "mur" ? "" : "aspect-[4/3.4] sm:aspect-[4/3]",
              )}
            >
              {view === "apercu" && kind === "plate" && (
                <div className="absolute inset-0 grid place-items-center p-[9%]">
                  <div
                    key={`${size}-${frame}-${finish}`}
                    className="glint glint-strong glint-intro plate relative max-h-full"
                    style={{
                      aspectRatio: `${dims.w} / ${dims.h}`,
                      height: landscape ? "auto" : `${62 + (dims.h / 90) * 34}%`,
                      width: landscape ? `${58 + (dims.w / 90) * 36}%` : "auto",
                      backgroundColor: art.color,
                      boxShadow:
                        frame !== "aucun"
                          ? `0 0 0 clamp(6px,1.4vw,14px) ${getFrame(frame).color}, 0 30px 50px -20px rgba(0,0,0,.5)`
                          : undefined,
                    }}
                  >
                    <Image src={art.image} alt={art.title} fill priority sizes="(min-width:1024px) 55vw, 90vw" className="rounded-[2px] object-cover" />
                    {finish !== "mat" && (
                      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,.2)_0%,transparent_35%,transparent_70%,rgba(255,255,255,.06)_100%)]" />
                    )}
                  </div>
                </div>
              )}
              {view === "apercu" && kind === "case" && (
                <div className="absolute inset-0 grid place-items-center py-[7%]">
                  <PhoneMockup key={phone.id} image={art.image} phone={phone} className="glint glint-intro h-full" />
                </div>
              )}
              {view === "3d" && (
                <div className="absolute inset-0">
                  {kind === "plate" ? (
                    <PlateViewer image={art.image} dims={dims} finish={finish} frame={frame} />
                  ) : (
                    <PhoneViewer image={art.image} phone={phone} caseType={caseType} />
                  )}
                  <p className="label pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap text-paper/50">
                    <RotateCcw className="size-3.5" /> Glissez pour tourner · pincez pour zoomer
                  </p>
                </div>
              )}
              {view === "mur" && (
                <RoomPreview image={art.image} dims={dims} frame={frame} finish={finish} />
              )}
              {view === "detail" && <DetailZoom src={art.image} />}
            </div>

            <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Vues">
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
                  {v.icon}
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ------- Buy box ------- */}
        <div className="min-w-0 lg:col-span-5 xl:col-span-4">
          {collection && (
            <Link href={`/collections/${collection.slug}`} className="label link-u text-ember-deep">
              {collection.name}
            </Link>
          )}
          <h1 className="display mt-3 text-[48px] sm:text-[60px]">{art.title}</h1>
          <p className="mt-3 text-[15px] text-stone">
            {art.artist} · {art.year}
          </p>

          <div className="mt-6 flex items-end justify-between border-y border-ink/12 py-4">
            <div>
              <p className="text-[30px] font-semibold leading-none tabular-nums">{formatDH(price * qty)}</p>
              <p className="mt-1.5 text-[12.5px] text-stone">
                {qty > 1 ? `${qty} × ${formatDH(price)} · ` : ""}TVA incluse · paiement à la livraison
              </p>
            </div>
            <button
              onClick={() => toggleLike(art.slug)}
              className="flex items-center gap-2 text-[13px]"
              aria-pressed={hydrated && liked}
            >
              <Heart className={cn("size-[18px]", hydrated && liked && "fill-ember stroke-ember")} strokeWidth={1.6} />
              {hydrated && liked ? "Dans vos favoris" : "Favori"}
            </button>
          </div>

          <div className="mt-6 space-y-7">
            <KindToggle value={kind} onChange={switchKind} />
            {kind === "plate" ? (
              <>
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

            <div className="flex gap-2">
              <QtyStepper value={qty} onChange={setQty} />
              <button
                onClick={addToCart}
                className={cn(
                  "flex h-[54px] flex-1 items-center justify-center gap-3 text-[14px] font-semibold uppercase tracking-[0.06em] transition-colors",
                  added ? "bg-ok text-white" : "bg-ink text-paper hover:bg-ember",
                )}
              >
                {added ? (
                  <>
                    <Check className="size-4" /> Ajouté au panier
                  </>
                ) : (
                  <>Ajouter au panier</>
                )}
              </button>
            </div>

            <div className="space-y-3 bg-paper-2 p-4">
              <DeliveryEstimate />
              <div className="flex gap-3 text-[13.5px]">
                <Banknote className="mt-0.5 size-[18px] shrink-0" strokeWidth={1.5} />
                <p>Vous payez à la livraison, en espèces, après avoir vu votre colis.</p>
              </div>
              {kind === "plate" && (
                <div className="flex gap-3 text-[13.5px]">
                  <Magnet className="mt-0.5 size-[18px] shrink-0" strokeWidth={1.5} />
                  <p>Kit de fixation aimanté inclus. Aucun perçage, aucune trace.</p>
                </div>
              )}
            </div>

            <div>
              <Accordion title="L'œuvre" defaultOpen>
                <p>
                  <strong>{art.title}</strong>, {art.artist}, {art.year}. Une œuvre du domaine public, reproduite à partir
                  d&apos;une numérisation haute définition puis recadrée et étalonnée pour l&apos;impression sur métal.
                </p>
                <p className="mt-2">
                  Mots-clés :{" "}
                  {art.tags.map((t, i) => (
                    <Link key={t} href={`/boutique?q=${encodeURIComponent(t)}`} className="link-u">
                      {t}
                      {i < art.tags.length - 1 ? ", " : ""}
                    </Link>
                  ))}
                </p>
                <p className="mt-2 text-[12.5px] text-stone">
                  Source :{" "}
                  <a href={art.source} target="_blank" rel="noreferrer" className="underline">
                    numérisation d&apos;origine
                  </a>{" "}
                  · {art.license}
                </p>
              </Accordion>
              {kind === "plate" ? (
                <Accordion title="Matière & impression">
                  <ul className="space-y-1.5">
                    <li>Plaque métal de 1 mm, bords ébavurés et coins adoucis.</li>
                    <li>Impression UV directe : encres CMJN + blanc, polymérisées par lumière UV.</li>
                    <li>Résiste à l&apos;eau, aux UV et aux rayures du quotidien. Un chiffon doux suffit.</li>
                    <li>Poids léger, livrée avec un aimant adhésif et une notice.</li>
                  </ul>
                </Accordion>
              ) : (
                <Accordion title="La coque">
                  <ul className="space-y-1.5">
                    <li>Impression UV bord à bord, sans sticker ni film qui se décolle.</li>
                    <li>Bords surélevés pour protéger l&apos;écran et la caméra.</li>
                    <li>Compatible recharge sans fil{phone.magsafe ? " et MagSafe (version Slim)" : ""}.</li>
                  </ul>
                </Accordion>
              )}
              <Accordion title="Livraison, paiement & retours">
                <ul className="space-y-1.5">
                  <li>Production en 48 h dans notre atelier, puis livraison en 24 à 72 h.</li>
                  <li>Paiement en espèces à la livraison, partout au Maroc.</li>
                  <li>Livraison offerte dès 500 DH, sinon 35 DH.</li>
                  <li>
                    Arrivée abîmée ? On la réimprime gratuitement. Retours sous 14 jours pour les œuvres du catalogue.{" "}
                    <Link href="/aide#retours" className="underline">En savoir plus</Link>
                  </li>
                </ul>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailZoom({ src }: { src: string }) {
  const [pos, setPos] = useState({ x: 50, y: 50 });
  return (
    <div
      className="absolute inset-0 cursor-crosshair overflow-hidden"
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Détail de l'œuvre"
        className="absolute inset-0 size-full object-cover transition-transform duration-200 ease-out"
        style={{ transform: "scale(2.6)", transformOrigin: `${pos.x}% ${pos.y}%` }}
        draggable={false}
      />
      <p className="label pointer-events-none absolute bottom-4 left-4 bg-paper/85 px-2 py-1 text-[10px]">
        Survolez pour explorer le détail
      </p>
    </div>
  );
}
