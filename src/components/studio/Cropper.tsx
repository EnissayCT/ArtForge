"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { PhoneModel } from "@/lib/phones";
import { clampPan, rotated, scaleFor, type CropState, type Natural } from "./crop";
import { cn } from "@/lib/utils";

/**
 * Drag to pan, wheel or pinch to zoom. Everything is expressed relative to
 * the frame so the exported file matches the preview exactly.
 */
export function Cropper({
  src,
  natural,
  aspect,
  state,
  onChange,
  phone,
  className,
}: {
  src: string;
  natural: Natural;
  aspect: number;
  state: CropState;
  onChange: (s: CropState) => void;
  phone?: PhoneModel;
  className?: string;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 600, h: 800 });
  const [dragging, setDragging] = useState(false);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{ x: number; y: number; sx: number; sy: number; dist?: number; zoom: number } | null>(null);
  const stateRef = useRef(state);
  useLayoutEffect(() => {
    stateRef.current = state;
  });

  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setSize({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // wheel zoom needs a non-passive listener
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const on = (e: WheelEvent) => {
      e.preventDefault();
      const s = stateRef.current;
      const zoom = Math.max(1, Math.min(5, s.zoom * Math.exp(-e.deltaY * 0.0015)));
      onChange(clampPan(natural, { ...s, zoom }, aspect));
    };
    el.addEventListener("wheel", on, { passive: false });
    return () => el.removeEventListener("wheel", on);
  }, [natural, aspect, onChange]);

  function down(e: React.PointerEvent) {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const s = stateRef.current;
    if (pts.length === 1) gesture.current = { x: e.clientX, y: e.clientY, sx: s.x, sy: s.y, zoom: s.zoom };
    if (pts.length === 2) {
      gesture.current = {
        x: (pts[0].x + pts[1].x) / 2,
        y: (pts[0].y + pts[1].y) / 2,
        sx: s.x,
        sy: s.y,
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        zoom: s.zoom,
      };
    }
    setDragging(true);
  }

  function move(e: React.PointerEvent) {
    if (!pointers.current.has(e.pointerId) || !gesture.current) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const pts = [...pointers.current.values()];
    const g = gesture.current;
    const s = stateRef.current;
    if (pts.length >= 2 && g.dist) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
      const zoom = Math.max(1, Math.min(5, g.zoom * (dist / g.dist)));
      onChange(clampPan(natural, { ...s, zoom }, aspect));
    } else if (pts.length === 1) {
      onChange(
        clampPan(
          natural,
          { ...s, x: g.sx + (e.clientX - g.x) / size.w, y: g.sy + (e.clientY - g.y) / size.h },
          aspect,
        ),
      );
    }
  }

  function up(e: React.PointerEvent) {
    pointers.current.delete(e.pointerId);
    const pts = [...pointers.current.values()];
    const s = stateRef.current;
    gesture.current = pts.length === 1 ? { x: pts[0].x, y: pts[0].y, sx: s.x, sy: s.y, zoom: s.zoom } : null;
    if (pts.length === 0) setDragging(false);
  }

  const S = scaleFor(natural, state, size.w, size.h);
  const r = rotated(natural, state.rot);
  void r;

  return (
    <div
      ref={frame}
      className={cn("relative w-full touch-none select-none overflow-hidden", dragging ? "cursor-grabbing" : "cursor-grab", className)}
      style={{
        aspectRatio: `${aspect}`,
        background: state.bg,
        borderRadius: phone ? `${(phone.radius / phone.w) * 100}% / ${(phone.radius / phone.h) * 100}%` : 2,
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt="Votre image"
        draggable={false}
        className="pointer-events-none absolute left-1/2 top-1/2 max-w-none"
        style={{
          width: natural.w * S,
          height: natural.h * S,
          transform: `translate(-50%, -50%) translate(${state.x * size.w}px, ${state.y * size.h}px) rotate(${state.rot}deg)`,
        }}
      />
      {/* rule of thirds while dragging */}
      <div className={cn("pointer-events-none absolute inset-0 transition-opacity duration-300", dragging ? "opacity-100" : "opacity-0")}>
        {[1, 2].map((n) => (
          <div key={`v${n}`} className="absolute inset-y-0 w-px bg-white/60 mix-blend-difference" style={{ left: `${(n / 3) * 100}%` }} />
        ))}
        {[1, 2].map((n) => (
          <div key={`h${n}`} className="absolute inset-x-0 h-px bg-white/60 mix-blend-difference" style={{ top: `${(n / 3) * 100}%` }} />
        ))}
      </div>
      {/* safe margin */}
      <div className="pointer-events-none absolute inset-[2.5%] border border-dashed border-white/50 mix-blend-difference" />
      {phone && (
        <div className="pointer-events-none absolute inset-0">
          {phone.module && (
            <div
              className="absolute bg-ink/55 ring-1 ring-white/30"
              style={{
                left: `${(phone.module.x / phone.w) * 100}%`,
                top: `${(phone.module.y / phone.h) * 100}%`,
                width: `${(phone.module.w / phone.w) * 100}%`,
                height: `${(phone.module.h / phone.h) * 100}%`,
                borderRadius: `${(phone.module.r / phone.module.w) * 100}% / ${(phone.module.r / phone.module.h) * 100}%`,
              }}
            />
          )}
          {phone.lenses.map((l, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-ink/70 ring-1 ring-white/30"
              style={{
                left: `${((l.x - l.r) / phone.w) * 100}%`,
                top: `${((l.y - l.r) / phone.h) * 100}%`,
                width: `${((l.r * 2) / phone.w) * 100}%`,
                aspectRatio: "1",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
