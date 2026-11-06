import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, SAFE } from "../theme";
import { reveal } from "../lib/anim";

const grainSvg = (alpha: number, rgb: [number, number, number]) =>
  `url("data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 ${rgb[0]}  0 0 0 0 ${rgb[1]}  0 0 0 0 ${rgb[2]}  0 0 0 ${alpha} 0'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
  )}")`;

const GRAIN_DARK = grainSvg(0.35, [0.5, 0.45, 0.4]);
const GRAIN_LIGHT = grainSvg(0.22, [1, 0.97, 0.92]);

/** Film-like grain that shifts every frame (deterministic). */
export const Grain: React.FC<{ tone?: "paper" | "ink"; opacity?: number }> = ({ tone = "paper", opacity }) => {
  const f = useCurrentFrame();
  const ox = (f * 73) % 240;
  const oy = (f * 151) % 240;
  return (
    <AbsoluteFill
      style={{
        pointerEvents: "none",
        backgroundImage: tone === "paper" ? GRAIN_DARK : GRAIN_LIGHT,
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: tone === "paper" ? "multiply" : "screen",
        opacity: opacity ?? (tone === "paper" ? 0.45 : 0.18),
      }}
    />
  );
};

/** Bone-paper backdrop with soft top light and grain. */
export const Paper: React.FC<{ color?: string; children?: React.ReactNode }> = ({ color = C.paper, children }) => (
  <AbsoluteFill style={{ backgroundColor: color }}>
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 85% 55% at 50% 30%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0) 70%), radial-gradient(ellipse 120% 90% at 50% 50%, rgba(0,0,0,0) 55%, rgba(60,45,30,0.12) 100%)",
      }}
    />
    <Grain tone="paper" />
    {children}
  </AbsoluteFill>
);

/** Ink showcase backdrop (the site hero: dark with a warm glow). */
export const Ink: React.FC<{ glow?: { x: number; y: number }; children?: React.ReactNode }> = ({
  glow = { x: 50, y: 42 },
  children,
}) => (
  <AbsoluteFill style={{ backgroundColor: C.ink }}>
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse 80% 55% at ${glow.x}% ${glow.y}%, #2f2a25 0%, rgba(19,18,17,0) 72%)`,
      }}
    />
    <Grain tone="ink" />
    {children}
  </AbsoluteFill>
);

/** One line of display type revealed from below through a mask. */
export const Line: React.FC<{
  start?: number;
  dur?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  instant?: boolean;
}> = ({ start = 0, dur = 7, children, style, instant }) => {
  const f = useCurrentFrame();
  const p = instant ? 1 : reveal(f, start, dur);
  return (
    <div style={{ overflow: "hidden", padding: "0.16em 0.06em 0.06em", margin: "-0.16em -0.06em -0.06em", ...style }}>
      <div style={{ translate: `0 ${((1 - p) * 110).toFixed(2)}%`, opacity: p > 0 ? 1 : 0 }}>{children}</div>
    </div>
  );
};

/** Fade + small rise, for labels. */
export const Rise: React.FC<{ start?: number; dur?: number; dist?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  start = 0,
  dur = 8,
  dist = 18,
  children,
  style,
}) => {
  const f = useCurrentFrame();
  const p = reveal(f, start, dur);
  return <div style={{ opacity: p, translate: `0 ${((1 - p) * dist).toFixed(1)}px`, ...style }}>{children}</div>;
};

/** Debug overlay: Reels UI zones (only when the `safe` prop is on). */
export const SafeZones: React.FC = () => {
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width, height: SAFE.top, background: "rgba(255,0,80,0.28)" }} />
      <div style={{ position: "absolute", left: 0, top: SAFE.bottom, width, height: height - SAFE.bottom, background: "rgba(255,0,80,0.28)" }} />
      <div style={{ position: "absolute", left: 0, top: 0, width: 65, height, background: "rgba(255,0,80,0.2)" }} />
      <div style={{ position: "absolute", right: 0, top: 0, width: 65, height, background: "rgba(255,0,80,0.2)" }} />
    </AbsoluteFill>
  );
};

/** Display text with a brushed-metal fill and a light band sweeping across (`pos` -1 → 1). */
export const ShineText: React.FC<{ pos: number | null; children: React.ReactNode; style?: React.CSSProperties }> = ({
  pos,
  children,
  style,
}) => {
  const x = pos === null ? -100 : 100 - ((pos + 1) / 2) * 100;
  return (
    <span
      style={{
        ...style,
        backgroundImage: `linear-gradient(112deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.95) 48%, rgba(255,255,255,0) 56%), linear-gradient(180deg, #f7f4ef 0%, #e6e0d6 55%, #c9c1b5 100%)`,
        backgroundSize: "300% 100%, 100% 100%",
        backgroundPosition: `${x}% 0, 0 0`,
        backgroundRepeat: "no-repeat",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
};
