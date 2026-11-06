import { Easing, interpolate } from "remotion";

export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Site easings (globals.css). */
export const outExpo = Easing.bezier(0.16, 1, 0.3, 1);
export const inOutQuart = Easing.bezier(0.76, 0, 0.24, 1);
export const outCubic = Easing.bezier(0.33, 1, 0.68, 1);

/** 0→1 between frames a and b, clamped. */
export const prog = (f: number, a: number, b: number, easing: (t: number) => number = (t) => t) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing });

export interface SnapState {
  x: number;
  y: number;
  scale: number;
  rot: number;
  /** 0 = flush on the wall, 1 = far from it (drives the shadow) */
  lift: number;
  blur: number;
  opacity: number;
}

export interface SnapOpts {
  /** frames of flight before contact */
  dur?: number;
  /** start offset from the resting position, px */
  dx?: number;
  dy?: number;
  /** start scale (>1 = closer to the camera) */
  s0?: number;
  /** start rotation, deg */
  rot0?: number;
  /** strength of the settle bounce */
  bounce?: number;
}

/**
 * The "magnet snap": the plate accelerates toward the wall (magnet pull), lands on
 * `snap`, compresses a hair, settles with a small damped bounce while the shadow tightens.
 */
export function snapState(f: number, snap: number, o: SnapOpts = {}): SnapState {
  const dur = o.dur ?? 14;
  const dx = o.dx ?? 0;
  const dy = o.dy ?? 380;
  const s0 = o.s0 ?? 1.45;
  const rot0 = o.rot0 ?? -7;
  const bounce = o.bounce ?? 1;
  const start = snap - dur;
  if (f < start) return { x: dx, y: dy, scale: s0, rot: rot0, lift: 1, blur: 0, opacity: 0 };
  if (f < snap) {
    const p = (f - start) / dur;
    const e = Math.pow(p, 2.3);
    return {
      x: dx * (1 - e),
      y: dy * (1 - e),
      scale: 1 + (s0 - 1) * (1 - e),
      rot: rot0 * (1 - e),
      lift: 1 - e * 0.82,
      blur: Math.min(7, 9 * Math.pow(p, 1.4)) * (p > 0.12 ? 1 : p / 0.12),
      opacity: clamp(p * 3.5),
    };
  }
  const t = f - snap;
  const k = Math.exp(-t / 3.2) * bounce;
  return {
    x: 0,
    y: -5 * k * Math.sin(t * 1.35),
    scale: 1 - 0.032 * k * Math.cos(t * 1.25),
    rot: 0.7 * k * Math.sin(t * 1.5),
    lift: 0.16 * Math.exp(-t / 2.6),
    blur: 0,
    opacity: 1,
  };
}

/** Reverse snap: the plate pulls off the wall toward the camera and leaves the frame. */
export function releaseState(f: number, release: number, o: SnapOpts = {}): SnapState {
  const dur = o.dur ?? 16;
  const dx = o.dx ?? 0;
  const dy = o.dy ?? -420;
  const s0 = o.s0 ?? 1.45;
  const rot0 = o.rot0 ?? 6;
  if (f < release) return { x: 0, y: 0, scale: 1, rot: 0, lift: 0, blur: 0, opacity: 1 };
  const p = clamp((f - release) / dur);
  const e = Math.pow(p, 2.2);
  return {
    x: dx * e,
    y: dy * e,
    scale: 1 + (s0 - 1) * e,
    rot: rot0 * e,
    lift: clamp(e * 1.4),
    blur: Math.min(7, 9 * Math.pow(p, 1.3)),
    opacity: 1 - clamp((p - 0.75) * 4),
  };
}

/** Small decaying camera shake triggered at frame `at`. */
export function shake(f: number, at: number, amp = 7) {
  const t = f - at;
  if (t < 0) return { x: 0, y: 0 };
  const k = Math.exp(-t / 2.4) * amp;
  return { x: k * Math.sin(t * 2.1 + 0.6) * 0.45, y: k * Math.sin(t * 2.9) };
}

/** Glint position (-1 → 1) sweeping from frame a over `dur` frames; null when idle. */
export function glintAt(f: number, a: number, dur = 26): number | null {
  if (f < a - 1 || f > a + dur + 1) return null;
  return interpolate(f, [a, a + dur], [-1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: inOutQuart,
  });
}

/** Line reveal from below (mask), 0→1. */
export const reveal = (f: number, start: number, dur = 7) => prog(f, start, start + dur, outExpo);
