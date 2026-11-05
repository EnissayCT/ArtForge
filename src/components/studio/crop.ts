export type Rotation = 0 | 90 | 180 | 270;

export interface CropState {
  zoom: number;
  /** pan, as a fraction of the frame size */
  x: number;
  y: number;
  rot: Rotation;
  mode: "fill" | "fit";
  bg: string;
}

export const INITIAL_CROP: CropState = { zoom: 1, x: 0, y: 0, rot: 0, mode: "fill", bg: "#ffffff" };

export interface Natural {
  w: number;
  h: number;
}

export function rotated(n: Natural, rot: Rotation): Natural {
  return rot % 180 ? { w: n.h, h: n.w } : n;
}

/** display/output pixels per source pixel for a frame of the given size */
export function scaleFor(n: Natural, s: CropState, frameW: number, frameH: number) {
  const r = rotated(n, s.rot);
  const base = s.mode === "fill" ? Math.max(frameW / r.w, frameH / r.h) : Math.min(frameW / r.w, frameH / r.h);
  return base * s.zoom;
}

export function clampPan(n: Natural, s: CropState, aspect: number): CropState {
  // work in a 1 × (1/aspect) frame
  const fw = 1;
  const fh = 1 / aspect;
  const S = scaleFor(n, s, fw, fh);
  const r = rotated(n, s.rot);
  const dw = r.w * S;
  const dh = r.h * S;
  const mx = Math.abs(dw - fw) / 2 / fw;
  const my = Math.abs(dh - fh) / 2 / fh;
  return { ...s, x: Math.max(-mx, Math.min(mx, s.x)), y: Math.max(-my, Math.min(my, s.y)) };
}

/** Source pixels that end up across the print width. */
export function sourcePxAcross(n: Natural, s: CropState, aspect: number) {
  const S = scaleFor(n, s, 1, 1 / aspect);
  return 1 / S;
}

export function effectiveDpi(n: Natural, s: CropState, aspect: number, printWidthCm: number) {
  return sourcePxAcross(n, s, aspect) / (printWidthCm / 2.54);
}

export function qualityOf(dpi: number) {
  if (dpi >= 150) return { level: 3, label: "Excellente", hint: "Netteté parfaite, même de près." } as const;
  if (dpi >= 100) return { level: 2, label: "Bonne", hint: "Très nette à distance normale." } as const;
  if (dpi >= 70) return { level: 1, label: "Moyenne", hint: "Légèrement douce de près. Réduisez le zoom ou la taille." } as const;
  return { level: 0, label: "Faible", hint: "Risque de flou visible. Choisissez une image plus grande ou un format plus petit." } as const;
}

export function renderCrop(
  img: CanvasImageSource,
  n: Natural,
  s: CropState,
  outW: number,
  outH: number,
  type: "image/jpeg" | "image/png" = "image/jpeg",
) {
  const c = document.createElement("canvas");
  c.width = Math.round(outW);
  c.height = Math.round(outH);
  const g = c.getContext("2d")!;
  g.imageSmoothingEnabled = true;
  g.imageSmoothingQuality = "high";
  g.fillStyle = s.bg;
  g.fillRect(0, 0, c.width, c.height);
  const S = scaleFor(n, s, c.width, c.height);
  g.translate(c.width / 2 + s.x * c.width, c.height / 2 + s.y * c.height);
  g.rotate((s.rot * Math.PI) / 180);
  g.scale(S, S);
  g.drawImage(img, -n.w / 2, -n.h / 2, n.w, n.h);
  void type;
  return c;
}

/** Average colour of an image, for a sensible background in "fit" mode. */
export function averageColor(img: CanvasImageSource) {
  const c = document.createElement("canvas");
  c.width = 24;
  c.height = 24;
  const g = c.getContext("2d")!;
  g.drawImage(img, 0, 0, 24, 24);
  const d = g.getImageData(0, 0, 24, 24).data;
  let r = 0,
    gg = 0,
    b = 0;
  for (let i = 0; i < d.length; i += 4) {
    r += d[i];
    gg += d[i + 1];
    b += d[i + 2];
  }
  const n = d.length / 4;
  const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
  return `#${hex(r)}${hex(gg)}${hex(b)}`;
}
