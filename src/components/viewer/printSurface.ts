import * as THREE from "three";
import type { FinishLook } from "@/lib/pricing";

/*
 * Procedural surface for a UV print on metal, computed from the artwork itself.
 *
 * UV printers lay CMYK (+ white) ink that is cured instantly by UV light, so the
 * ink stays where it lands: dense, dark and saturated areas carry more ink and
 * stand slightly proud of the plate; the cured layer has a fine "orange peel"
 * grain; a gloss varnish adds its own micro-texture; on brushed aluminium the
 * light areas get little or no white ink, so the bare brushed metal shows.
 *
 * We turn that into maps for MeshPhysicalMaterial:
 *   normalMap      ink relief + grain (same UV transform as the artwork)
 *   ormMap         G = roughness, B = metalness (brushed metal mask + streaks)
 *   peel           tiled orange-peel normal map for the gloss varnish (clearcoat)
 */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

/** Deterministic PRNG so every artwork always gets the same grain. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** One separable box-blur pass (radius r), in place. */
function boxBlur(src: Float32Array, w: number, h: number, r: number) {
  const tmp = new Float32Array(src.length);
  const n = 2 * r + 1;
  for (let y = 0; y < h; y++) {
    let acc = 0;
    const row = y * w;
    for (let x = -r; x <= r; x++) acc += src[row + Math.min(w - 1, Math.max(0, x))];
    for (let x = 0; x < w; x++) {
      tmp[row + x] = acc / n;
      acc += src[row + Math.min(w - 1, x + r + 1)] - src[row + Math.max(0, x - r)];
    }
  }
  for (let x = 0; x < w; x++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x];
    for (let y = 0; y < h; y++) {
      src[y * w + x] = acc / n;
      acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x];
    }
  }
}

/** Height field -> tangent-space normal map (OpenGL convention, +Y up). */
function heightToNormals(hgt: Float32Array, w: number, h: number, strength: number, wrap: boolean) {
  const out = new Uint8ClampedArray(w * h * 4);
  const at = (x: number, y: number) => {
    if (wrap) return hgt[((y + h) % h) * w + ((x + w) % w)];
    return hgt[Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))];
  };
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const dx = (at(x + 1, y) - at(x - 1, y)) * strength;
      // canvas rows go down, texture v goes up
      const dy = (at(x, y + 1) - at(x, y - 1)) * strength;
      let nx = -dx;
      let ny = dy;
      let nz = 1;
      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;
      const i = (y * w + x) * 4;
      out[i] = (nx * 0.5 + 0.5) * 255;
      out[i + 1] = (ny * 0.5 + 0.5) * 255;
      out[i + 2] = (nz * 0.5 + 0.5) * 255;
      out[i + 3] = 255;
    }
  }
  return out;
}

function toTexture(data: Uint8ClampedArray, w: number, h: number, srgb = false) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  c.getContext("2d")!.putImageData(new ImageData(data as Uint8ClampedArray<ArrayBuffer>, w, h), 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.anisotropy = 8;
  return t;
}

export interface PrintMaps {
  normal: THREE.Texture;
  orm: THREE.Texture;
}

/** Builds the ink-relief normal map and the roughness/metalness map for one artwork. */
export function buildPrintMaps(image: CanvasImageSource & { width: number; height: number }, look: FinishLook, seed = 1): PrintMaps {
  const max = 1024;
  const scale = Math.min(1, max / Math.max(image.width, image.height));
  const W = Math.max(8, Math.round(image.width * scale));
  const H = Math.max(8, Math.round(image.height * scale));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d", { willReadFrequently: true })!;
  g.drawImage(image, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H).data;
  const N = W * H;
  const rand = mulberry32(seed);

  const lum = new Float32Array(N);
  const ink = new Float32Array(N);
  const sat = new Float32Array(N);
  for (let i = 0; i < N; i++) {
    const r = px[i * 4] / 255;
    const gg = px[i * 4 + 1] / 255;
    const b = px[i * 4 + 2] / 255;
    const L = 0.2126 * r + 0.7152 * gg + 0.0722 * b;
    const mx = Math.max(r, gg, b);
    const S = mx - Math.min(r, gg, b);
    lum[i] = L;
    sat[i] = S;
    // ink coverage: dark and saturated areas carry the most ink
    ink[i] = clamp01(0.8 * (1 - L) + 0.4 * S);
  }
  // cured ink spreads a hair: soften the relief so it reads as layered ink, not as an emboss
  boxBlur(ink, W, H, 1);

  // orange-peel grain of the cured ink: white noise blurred into small cells
  const grain = new Float32Array(N);
  for (let i = 0; i < N; i++) grain[i] = rand();
  boxBlur(grain, W, H, 1);
  boxBlur(grain, W, H, 1);

  // brushed aluminium: fine horizontal streaks
  const streak = new Float32Array(N);
  if (look === "brosse") {
    const rows = new Float32Array(H);
    for (let y = 0; y < H; y++) rows[y] = rand();
    for (let y = 0; y < H; y++) {
      const base = (rows[y] * 0.7 + rows[Math.max(0, y - 1)] * 0.15 + rows[Math.min(H - 1, y + 1)] * 0.15) - 0.5;
      for (let x = 0; x < W; x++) streak[y * W + x] = base + (rand() - 0.5) * 0.15;
    }
  }

  const height = new Float32Array(N);
  const inkAmp = look === "brillant" ? 0.55 : look === "brosse" ? 0.7 : 0.8;
  const grainAmp = look === "mat" ? 0.35 : 0.22;
  for (let i = 0; i < N; i++) {
    height[i] = ink[i] * inkAmp + (grain[i] - 0.5) * grainAmp + streak[i] * 0.25;
  }
  const normal = toTexture(heightToNormals(height, W, H, 2.2, false), W, H);

  const orm = new Uint8ClampedArray(N * 4);
  for (let i = 0; i < N; i++) {
    let rough: number;
    let metal: number;
    if (look === "brosse") {
      // light, unsaturated areas: little white ink, the brushed metal shows through
      const bare = clamp01((lum[i] - 0.5) / 0.4) * clamp01(1 - sat[i] * 2.2);
      metal = 0.08 + bare * 0.9;
      rough = 0.74 - bare * 0.42 + streak[i] * 0.18 * bare + (grain[i] - 0.5) * 0.06;
    } else if (look === "brillant") {
      metal = 0.04;
      rough = 0.42 + (grain[i] - 0.5) * 0.08;
    } else {
      metal = 0.02;
      // matte ink: velvety, slightly less rough where the ink is densest
      rough = 0.86 - ink[i] * 0.1 + (grain[i] - 0.5) * 0.08;
    }
    orm[i * 4] = 255;
    orm[i * 4 + 1] = clamp01(rough) * 255;
    orm[i * 4 + 2] = clamp01(metal) * 255;
    orm[i * 4 + 3] = 255;
  }
  return { normal, orm: toTexture(orm, W, H) };
}

let peelCache: THREE.Texture | null = null;

/** Tiled orange-peel micro texture of the gloss varnish (clearcoat normal map). */
export function orangePeel() {
  if (peelCache) return peelCache;
  const S = 256;
  const rand = mulberry32(7);
  const h = new Float32Array(S * S);
  for (let i = 0; i < h.length; i++) h[i] = rand();
  // wrap-aware blur: tile the noise 3×3, blur, keep the centre
  const big = new Float32Array(S * 3 * S * 3);
  for (let y = 0; y < S * 3; y++) for (let x = 0; x < S * 3; x++) big[y * S * 3 + x] = h[(y % S) * S + (x % S)];
  boxBlur(big, S * 3, S * 3, 2);
  boxBlur(big, S * 3, S * 3, 2);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) h[y * S + x] = big[(y + S) * S * 3 + (x + S)];
  const t = toTexture(heightToNormals(h, S, S, 9, true), S, S);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  peelCache = t;
  return t;
}
