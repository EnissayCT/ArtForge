import React, { useId } from "react";
import { ARCHIVO } from "../theme";

/**
 * The brand mark from src/components/brand/Logo.tsx of the website: a metal plate with
 * a chamfered corner, crossed by the double glint of light. `glint` (0..1) slides the
 * stripes like the site's hover micro-interaction.
 */
export const Mark: React.FC<{ height: number; color?: string; glint?: number; style?: React.CSSProperties }> = ({
  height,
  color = "currentColor",
  glint = 0,
  style,
}) => {
  const id = useId().replace(/:/g, "");
  const dx = -3 + glint * 9;
  const dy = 2 - glint * 6;
  return (
    <svg viewBox="0 0 30 40" style={{ display: "block", height, width: (height * 30) / 40, ...style }} aria-hidden="true">
      <defs>
        <mask id={`m${id}`}>
          <path d="M0 1.2A1.2 1.2 0 0 1 1.2 0H25l5 5v33.8a1.2 1.2 0 0 1-1.2 1.2H1.2A1.2 1.2 0 0 1 0 38.8Z" fill="#fff" />
          <g transform={`translate(${dx} ${dy})`}>
            <path d="M-2 29.6 32 6.2v5.4L-2 35Z" fill="#000" />
            <path d="M-2 38.4 32 15v1.9L-2 40.3Z" fill="#000" />
          </g>
        </mask>
      </defs>
      <rect width="30" height="40" fill={color} mask={`url(#m${id})`} />
    </svg>
  );
};

/** Wordmark: Archivo extra-bold, uppercase, condensed (wdth 62%) — like the site header. */
export const Wordmark: React.FC<{ brand: string; size: number; color?: string; style?: React.CSSProperties }> = ({
  brand,
  size,
  color = "currentColor",
  style,
}) => (
  <span
    style={{
      fontFamily: ARCHIVO,
      fontWeight: 800,
      fontStretch: "62%",
      textTransform: "uppercase",
      letterSpacing: "0.02em",
      lineHeight: 1,
      fontSize: size,
      color,
      whiteSpace: "nowrap",
      ...style,
    }}
  >
    {brand}
  </span>
);

/** Mark + wordmark with the site's proportions (26 px mark for 23 px type, 10 px gap). */
export const Lockup: React.FC<{ brand: string; size: number; color?: string; glint?: number; style?: React.CSSProperties }> = ({
  brand,
  size,
  color = "currentColor",
  glint = 0,
  style,
}) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: size * 0.43, color, ...style }}>
    <Mark height={size * 1.13} color={color} glint={glint} />
    <Wordmark brand={brand} size={size} color={color} />
  </div>
);
