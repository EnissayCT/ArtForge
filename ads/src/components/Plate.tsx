import React from "react";
import { Img, staticFile } from "remotion";

export type Finish = "gloss" | "mat" | "brushed";
export type FrameKind = "none" | "oak" | "black";

/**
 * Diagonal light sweeping over polished metal — the site's `.glint` / `.glint-strong`,
 * doubled like the two stripes of the logo mark. `pos` runs -1 → 1.
 */
export const Glint: React.FC<{ pos: number | null; strength?: number; angle?: number }> = ({
  pos,
  strength = 1,
  angle = 112,
}) => {
  if (pos === null) return null;
  const s = strength;
  const band = (a: number) =>
    `linear-gradient(${angle}deg, transparent 35%, rgba(255,255,255,${0.1 * a}) 43%, rgba(255,255,255,${0.95 * a}) 49.5%, rgba(255,255,255,${0.14 * a}) 54%, transparent 56.5%, rgba(255,255,255,${0.55 * a}) 59%, transparent 61%)`;
  const common: React.CSSProperties = {
    position: "absolute",
    inset: "-20%",
    pointerEvents: "none",
    translate: `${pos * 75}% 0`,
  };
  return (
    <>
      <div style={{ ...common, background: band(s), mixBlendMode: "soft-light" }} />
      <div style={{ ...common, background: band(0.42 * s), mixBlendMode: "screen" }} />
    </>
  );
};

export interface PlateProps {
  src: string;
  w: number;
  h: number;
  glint?: number | null;
  /** 0 = flush on the wall, 1 = far away (soft, offset shadow) */
  lift?: number;
  radius?: number;
  finish?: Finish;
  frame?: FrameKind;
  objectPosition?: string;
  /** shadow strength multiplier (dark walls need more) */
  shadow?: number;
  /** extra blur on the whole plate (motion) */
  blur?: number;
  style?: React.CSSProperties;
  /** rotate the bevel highlight (deg) when the plate turns in 3D */
  edgeAngle?: number;
  /** extra specular highlight for the gloss finish (0..1) */
  specular?: number;
  /** 0 = plain photo (no bevel/sheen), 1 = full metal look — for the photo→metal morph */
  metal?: number;
  /** override the drop shadow entirely */
  boxShadow?: string;
}

/**
 * A UV-printed metal plate: slight rounded corners, thin bright bevel, gloss sheen,
 * diagonal glint, and a layered contact shadow that tightens as it reaches the wall.
 */
export const Plate: React.FC<PlateProps> = ({
  src,
  w,
  h,
  glint = null,
  lift = 0,
  radius = 6,
  finish = "gloss",
  frame = "none",
  objectPosition = "50% 50%",
  shadow = 1,
  blur = 0,
  style,
  edgeAngle = 135,
  specular = 0,
  metal = 1,
  boxShadow: boxShadowOverride,
}) => {
  const l = Math.max(0, lift);
  const sy = 4 + 52 * l;
  const sx = sy * 0.18;
  const sb = 10 + 78 * l;
  const op = Math.min(0.85, 0.36 * shadow * (1 - 0.3 * l));
  const boxShadow = [
    `0 1px 1px rgba(0,0,0,${(0.28 * shadow * (1 - l)).toFixed(3)})`,
    `${(sx * 0.45).toFixed(1)}px ${(sy * 0.4 + 2).toFixed(1)}px ${(sb * 0.32).toFixed(1)}px ${(-3 - 4 * l).toFixed(1)}px rgba(0,0,0,${(op * 0.75).toFixed(3)})`,
    `${sx.toFixed(1)}px ${sy.toFixed(1)}px ${sb.toFixed(1)}px ${(-8 - 10 * l).toFixed(1)}px rgba(0,0,0,${op.toFixed(3)})`,
  ].join(", ");

  const pad = frame === "none" ? 0 : Math.round(Math.min(w, h) * 0.055);
  const frameBg =
    frame === "oak"
      ? "linear-gradient(135deg, #c99a66 0%, #b88a5a 35%, #a47548 70%, #c29360 100%)"
      : frame === "black"
        ? "linear-gradient(135deg, #2a2826 0%, #1b1a19 50%, #121110 100%)"
        : undefined;

  const sheen =
    finish === "mat"
      ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%)"
      : finish === "brushed"
        ? "linear-gradient(125deg, rgba(255,255,255,0.12) 0%, transparent 40%)"
        : "linear-gradient(125deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 26%, transparent 44%, transparent 72%, rgba(255,255,255,0.08) 100%)";

  return (
    <div
      style={{
        position: "relative",
        width: w + pad * 2,
        height: h + pad * 2,
        padding: pad,
        borderRadius: frame === "none" ? radius : 3,
        background: frameBg,
        boxShadow: boxShadowOverride ?? boxShadow,
        filter: blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : undefined,
        ...style,
      }}
    >
      {frame !== "none" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 3,
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.18), inset 0 -2px 3px rgba(0,0,0,0.25)",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          width: w,
          height: h,
          borderRadius: frame === "none" ? radius : 1,
          overflow: "hidden",
          isolation: "isolate",
          background: "#777",
          boxShadow: frame !== "none" ? "0 0 0 1px rgba(0,0,0,0.35)" : undefined,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition }}
        />
        {finish === "brushed" && (
          <>
            {/* light areas turn into brushed aluminium: streaks multiply the whites, cool sheen on top */}
            <div style={{ position: "absolute", inset: 0, background: "#b9bdc1", mixBlendMode: "multiply", opacity: 0.55 }} />
            <Img
              src={staticFile("tex/brushed.png")}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "multiply", opacity: 0.75 }}
            />
            <Img
              src={staticFile("tex/brushed.png")}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "overlay", opacity: 0.6 }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(115deg, rgba(235,240,245,0.32) 0%, rgba(235,240,245,0.06) 35%, rgba(235,240,245,0.22) 62%, rgba(235,240,245,0.04) 100%)",
                mixBlendMode: "screen",
              }}
            />
          </>
        )}
        {finish === "mat" && <div style={{ position: "absolute", inset: 0, background: "rgba(245,240,232,0.06)" }} />}
        <div style={{ position: "absolute", inset: 0, background: sheen, opacity: metal }} />
        {specular > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              opacity: specular,
              background:
                "radial-gradient(ellipse 70% 38% at 28% 12%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 45%, rgba(255,255,255,0) 70%), linear-gradient(150deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 35%)",
              mixBlendMode: "screen",
            }}
          />
        )}
        <Glint pos={glint} strength={finish === "mat" ? 0.55 : 1} />
        {/* bevel: a thin bright edge brighter toward the light */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: frame === "none" ? radius : 1,
            padding: 2,
            background: `linear-gradient(${edgeAngle}deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 18%, rgba(255,255,255,0.1) 48%, rgba(255,255,255,0.22) 80%, rgba(255,255,255,0.6) 100%)`,
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
            opacity: 0.8 * metal,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: frame === "none" ? radius : 1,
            boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.18)",
          }}
        />
      </div>
    </div>
  );
};

/** The adhesive steel sheet that goes on the wall (brushed grey, no print). */
export const SteelSheet: React.FC<{ w: number; h: number; lift?: number; style?: React.CSSProperties }> = ({
  w,
  h,
  lift = 0,
  style,
}) => (
  <div
    style={{
      position: "relative",
      width: w,
      height: h,
      borderRadius: 4,
      overflow: "hidden",
      background: "linear-gradient(135deg, #c9cbcd 0%, #a9acaf 45%, #c4c6c8 70%, #9c9fa2 100%)",
      boxShadow: `0 1px 1px rgba(0,0,0,0.25), 0 ${2 + 30 * lift}px ${4 + 40 * lift}px -2px rgba(0,0,0,${0.25 + 0.1 * lift})`,
      ...style,
    }}
  >
    <Img
      src={staticFile("tex/brushed.png")}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", mixBlendMode: "overlay", opacity: 0.9 }}
    />
    <div style={{ position: "absolute", inset: 0, borderRadius: 4, boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.45), inset 0 -1px 0 rgba(0,0,0,0.2)" }} />
  </div>
);
