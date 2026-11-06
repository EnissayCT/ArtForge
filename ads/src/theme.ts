import type { CSSProperties } from "react";
import { loadVariableFont } from "@remotion/google-fonts/Archivo";
import { loadFont as loadPlexMono } from "@remotion/google-fonts/IBMPlexMono";

/** Palette from src/app/globals.css of the website. */
export const C = {
  paper: "#f1eee8",
  paper2: "#e8e3da",
  paper3: "#dcd5c9",
  ink: "#131211",
  ink2: "#1c1a18",
  ink3: "#2a2724",
  ink4: "#3a3632",
  stone: "#6d675f",
  stone2: "#9a948a",
  ember: "#e4572e",
  emberDeep: "#c2441f",
  brass: "#b8925a",
} as const;

/* Archivo with its width axis (wdth 62..125) so `font-stretch: 62%` gives the site's condensed display cut. */
export const ARCHIVO = loadVariableFont("normal", { subsets: ["latin", "latin-ext"] }).fontFamily;
export const PLEX_MONO = loadPlexMono("normal", { weights: ["400", "500"], subsets: ["latin", "latin-ext"] }).fontFamily;

/** `.display` from globals.css, scaled for video. */
export const display = (size: number, color: string = C.ink): CSSProperties => ({
  fontFamily: ARCHIVO,
  fontStretch: "62%",
  fontWeight: 800,
  textTransform: "uppercase",
  lineHeight: 0.86,
  letterSpacing: "-0.012em",
  fontSize: size,
  color,
  fontFeatureSettings: '"ss01", "kern"',
  margin: 0,
});

/** `.display-semi` — Archivo 75% width, 700. */
export const semi = (size: number, color: string = C.ink): CSSProperties => ({
  fontFamily: ARCHIVO,
  fontStretch: "75%",
  fontWeight: 700,
  lineHeight: 0.98,
  letterSpacing: "-0.005em",
  fontSize: size,
  color,
  margin: 0,
});

/** `.label` — IBM Plex Mono, uppercase, tracked. */
export const label = (size = 30, color: string = C.ink): CSSProperties => ({
  fontFamily: PLEX_MONO,
  fontWeight: 500,
  fontSize: size,
  lineHeight: 1.3,
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color,
  margin: 0,
});

/**
 * Reels safe zone on a 1080×1920 canvas (Meta ads guide: keep ~14% top, ~35% bottom
 * and ~6% each side free of text and key elements).
 */
export const SAFE = {
  top: 270,
  bottom: 1248,
  side: 72,
} as const;

export const FPS = 30;
