"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Move } from "lucide-react";
import { SCENES, type Scene } from "@/lib/media";
import type { FinishLook } from "@/lib/pricing";
import { clamp, cn } from "@/lib/utils";

const OWN_WALL_ID = "mon-mur";

interface Props {
  image: string;
  /** print size in cm, already oriented */
  dims: { w: number; h: number };
  /** frame colour, omit for no frame */
  frameColor?: string;
  finish?: FinishLook;
  sceneId?: string;
  onSceneChange?: (id: string) => void;
  controls?: boolean;
  draggable?: boolean;
  className?: string;
  imageStyle?: React.CSSProperties;
  sizesLabel?: boolean;
}

export function RoomPreview({
  image,
  dims,
  frameColor: frameProp,
  finish = "mat",
  sceneId,
  onSceneChange,
  controls = true,
  draggable = true,
  className,
  imageStyle,
  sizesLabel = true,
}: Props) {
  const [internalScene, setInternalScene] = useState(SCENES[0]?.id);
  const [ownWall, setOwnWall] = useState<{ url: string; w: number; h: number } | null>(null);
  const [ownWallCm, setOwnWallCm] = useState(300);
  const active = sceneId ?? internalScene;
  const box = useRef<HTMLDivElement>(null);
  const [boxW, setBoxW] = useState(800);
  // dragging offset, forgotten when the scene changes
  const [drift, setDrift] = useState({ scene: "", x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const scene: Scene | undefined =
    active === OWN_WALL_ID && ownWall
      ? {
          id: OWN_WALL_ID,
          name: "Mon mur",
          image: ownWall.url,
          w: ownWall.w,
          h: ownWall.h,
          anchor: { x: 0.5, y: 0.42 },
          cmPerWidth: ownWallCm,
          maxHeightCm: 400,
        }
      : (SCENES.find((s) => s.id === active) ?? SCENES[0]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBoxW(e.contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);


  if (!scene) return null;
  const offset = drift.scene === active ? drift : { x: 0, y: 0 };
  const setOffset = (o: { x: number; y: number }) => setDrift({ scene: active ?? "", ...o });

  const pick = (id: string) => (onSceneChange ? onSceneChange(id) : setInternalScene(id));

  const pxPerCm = boxW / scene.cmPerWidth;
  const cmPerHeight = scene.cmPerWidth * (scene.h / scene.w);
  // Prints hang with a constant gap above the furniture: the bottom edge
  // stays where a 40 cm-tall print centred on the anchor would end.
  const bottom = scene.anchor.y + 20 / cmPerHeight;
  const hFrac = dims.h / cmPerHeight;
  const wFrac = dims.w / scene.cmPerWidth;
  let top = bottom - hFrac;
  top = clamp(top, 0.02, 1 - hFrac - 0.02);
  const left = scene.anchor.x - wFrac / 2;

  const frameColor = frameProp && frameProp !== "transparent" ? frameProp : null;
  const framePx = frameColor ? Math.max(2, 2.2 * pxPerCm) : 0;
  const shadow = `${0.35 * pxPerCm}px ${0.9 * pxPerCm}px ${1.6 * pxPerCm}px rgba(0,0,0,.38), ${0.1 * pxPerCm}px ${0.25 * pxPerCm}px ${0.4 * pxPerCm}px rgba(0,0,0,.25)`;

  function onPointerDown(e: React.PointerEvent) {
    if (!draggable) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const el = box.current;
    if (!d || !el) return;
    const r = el.getBoundingClientRect();
    setOffset({
      x: clamp(d.ox + (e.clientX - d.x) / r.width, -left + 0.01, 1 - left - wFrac - 0.01),
      y: clamp(d.oy + (e.clientY - d.y) / r.height, -top + 0.01, 1 - top - hFrac - 0.01),
    });
  }
  function onPointerUp() {
    drag.current = null;
  }

  function onWallFile(file?: File) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new window.Image();
    img.onload = () => {
      setOwnWall({ url, w: img.naturalWidth, h: img.naturalHeight });
      pick(OWN_WALL_ID);
    };
    img.src = url;
  }

  return (
    <div className={cn("w-full", className)}>
      <div
        ref={box}
        className="relative w-full select-none overflow-hidden bg-paper-3"
        style={{ aspectRatio: `${scene.w} / ${scene.h}` }}
      >
        {scene.id === OWN_WALL_ID ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={scene.image} alt="Votre mur" className="absolute inset-0 size-full object-cover" />
        ) : (
          <Image src={scene.image} alt={`Mise en situation : ${scene.name}`} fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" priority />
        )}

        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "absolute touch-none transition-[width,height,top,left] duration-500 ease-[var(--ease-out-expo)]",
            draggable && "cursor-grab active:cursor-grabbing active:transition-none",
          )}
          style={{
            left: `${(left + offset.x) * 100}%`,
            top: `${(top + offset.y) * 100}%`,
            width: `${wFrac * 100}%`,
            height: `${hFrac * 100}%`,
            transform: scene.tilt ? `perspective(${Math.round(boxW * 1.4)}px) rotateY(${scene.tilt}deg)` : undefined,
          }}
        >
          <div
            key={`${image}-${dims.w}-${dims.h}`}
            className="glint glint-strong glint-intro absolute inset-0 overflow-hidden"
            style={{
              boxShadow: frameColor ? `0 0 0 ${framePx}px ${frameColor}, ${shadow}` : shadow,
              borderRadius: frameColor ? 0 : Math.max(1, 0.15 * pxPerCm),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" style={imageStyle} />
            {/* room light falling on the plate */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  finish === "brillant"
                    ? "linear-gradient(120deg, rgba(255,255,255,.22) 0%, rgba(255,255,255,0) 38%, rgba(0,0,0,0) 62%, rgba(0,0,0,.16) 100%)"
                    : finish === "brosse"
                      ? "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.03) 1px 2px), linear-gradient(120deg, rgba(255,255,255,.18), rgba(0,0,0,.12))"
                      : "linear-gradient(120deg, rgba(255,255,255,.08) 0%, rgba(0,0,0,0) 45%, rgba(0,0,0,.12) 100%)",
                mixBlendMode: "soft-light",
              }}
            />
          </div>
          {frameColor && (
            <div
              className="pointer-events-none absolute"
              style={{
                inset: -framePx,
                boxShadow: `inset 0 0 0 1px rgba(255,255,255,.12), inset ${framePx * 0.25}px ${framePx * 0.25}px ${framePx * 0.5}px rgba(255,255,255,.12)`,
              }}
            />
          )}
        </div>

        {sizesLabel && (
          <div className="label pointer-events-none absolute bottom-3 left-3 bg-paper/85 px-2 py-1 text-[10px] text-ink">
            {dims.w} × {dims.h} cm · {scene.name}
          </div>
        )}
        {dims.h > scene.maxHeightCm + 5 && scene.id !== OWN_WALL_ID && (
          <div className="label pointer-events-none absolute left-3 top-3 bg-ink/80 px-2 py-1 text-[10px] text-paper">
            Grand format pour ce mur — essayez le salon
          </div>
        )}
        {draggable && (
          <div className="label pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1.5 bg-ink/70 px-2 py-1 text-[10px] text-paper sm:flex">
            <Move className="size-3" /> Glissez pour déplacer
          </div>
        )}
      </div>

      {controls && (
        <div className="mt-3">
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
            {SCENES.map((s) => (
              <button
                key={s.id}
                onClick={() => pick(s.id)}
                className={cn(
                  "group relative h-14 w-20 shrink-0 overflow-hidden outline-offset-2 transition-opacity",
                  active === s.id ? "outline outline-2 outline-ink" : "opacity-75 hover:opacity-100",
                )}
                aria-label={s.name}
                aria-pressed={active === s.id}
              >
                <Image src={s.image} alt="" fill sizes="80px" className="object-cover" />
                <span className="label absolute inset-x-0 bottom-0 bg-ink/60 py-0.5 text-center text-[9px] text-paper">{s.name}</span>
              </button>
            ))}
            <button
              onClick={() => (ownWall ? pick(OWN_WALL_ID) : fileInput.current?.click())}
              className={cn(
                "relative flex h-14 w-20 shrink-0 flex-col items-center justify-center gap-1 overflow-hidden border border-dashed border-ink/30 text-[10px] outline-offset-2",
                active === OWN_WALL_ID && "outline outline-2 outline-ink",
              )}
            >
              {ownWall ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={ownWall.url} alt="" className="absolute inset-0 size-full object-cover" />
                  <span className="label absolute inset-x-0 bottom-0 bg-ink/60 py-0.5 text-center text-[9px] text-paper">Mon mur</span>
                </>
              ) : (
                <>
                  <ImagePlus className="size-4" strokeWidth={1.5} />
                  <span className="label text-[9px]">Mon mur</span>
                </>
              )}
            </button>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => onWallFile(e.target.files?.[0])}
            />
          </div>
          {active === OWN_WALL_ID && ownWall && (
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[13px]">
              <label htmlFor="wallcm" className="text-stone">Largeur visible du mur</label>
              <input
                id="wallcm"
                type="range"
                min={120}
                max={700}
                step={10}
                value={ownWallCm}
                onChange={(e) => setOwnWallCm(Number(e.target.value))}
                className="w-40 accent-ink"
              />
              <span className="label">{(ownWallCm / 100).toFixed(1)} m</span>
              <button onClick={() => fileInput.current?.click()} className="label link-u ml-auto">
                Changer de photo
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
