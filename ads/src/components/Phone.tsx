import React from "react";
import { Img, staticFile } from "remotion";
import { PLEX_MONO } from "../theme";

/** Front of a generic modern phone; children render inside the screen. */
export const PhoneFrame: React.FC<{
  w: number;
  h: number;
  children?: React.ReactNode;
  screenBg?: string;
  style?: React.CSSProperties;
  dark?: boolean;
}> = ({ w, h, children, screenBg = "#000", style, dark = true }) => {
  const bezel = Math.round(w * 0.028);
  const r = w * 0.15;
  return (
    <div
      style={{
        position: "relative",
        width: w,
        height: h,
        borderRadius: r,
        background: "linear-gradient(140deg, #3b3a39 0%, #161514 40%, #0d0c0c 100%)",
        boxShadow:
          "inset 0 0 0 2px rgba(255,255,255,0.14), inset 0 0 0 4px rgba(0,0,0,0.6), 0 2px 3px rgba(0,0,0,0.35), 0 40px 70px -24px rgba(0,0,0,0.55), 0 80px 120px -50px rgba(0,0,0,0.45)",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: bezel,
          borderRadius: r - bezel,
          overflow: "hidden",
          background: screenBg,
          isolation: "isolate",
        }}
      >
        {children}
        {/* status bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: w * 0.12,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${w * 0.085}px`,
            fontFamily: PLEX_MONO,
            fontWeight: 500,
            fontSize: w * 0.04,
            color: dark ? "#fff" : "#131211",
          }}
        >
          <span>9:41</span>
          <span style={{ display: "flex", gap: w * 0.012, alignItems: "flex-end" }}>
            {[0.35, 0.55, 0.75, 1].map((k) => (
              <span key={k} style={{ width: w * 0.009, height: w * 0.026 * k, background: dark ? "#fff" : "#131211", borderRadius: 1 }} />
            ))}
            <span
              style={{
                marginLeft: w * 0.02,
                width: w * 0.056,
                height: w * 0.026,
                borderRadius: w * 0.007,
                border: `${Math.max(1, w * 0.003)}px solid ${dark ? "rgba(255,255,255,0.8)" : "rgba(19,18,17,0.8)"}`,
                padding: 1.5,
                boxSizing: "border-box",
              }}
            >
              <span style={{ display: "block", width: "78%", height: "100%", background: dark ? "#fff" : "#131211", borderRadius: 1 }} />
            </span>
          </span>
        </div>
        {/* dynamic island */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: w * 0.03,
            width: w * 0.27,
            height: w * 0.075,
            translate: "-50% 0",
            borderRadius: 999,
            background: "#000",
          }}
        />
      </div>
    </div>
  );
};

/* Printed case, back view — proportions of the iPhone 16 Pro from src/lib/phones.ts (mm). */
const PH = { w: 71.5, h: 149.6, radius: 11, module: { x: 6, y: 6, w: 37, h: 37, r: 9 } };
const LENSES = [
  { x: 6 + 37 * 0.27, y: 6 + 37 * 0.27, r: 37 * 0.19 },
  { x: 6 + 37 * 0.27, y: 6 + 37 * 0.73, r: 37 * 0.19 },
  { x: 6 + 37 * 0.73, y: 6 + 37 * 0.5, r: 37 * 0.19 },
];

/** Back view of a printed case, same layers as the site's PhoneMockup (sheen, lip, camera module). */
export const CaseMockup: React.FC<{ src: string; width: number; objectPosition?: string; sheenShift?: number; style?: React.CSSProperties }> = ({
  src,
  width,
  objectPosition = "50% 50%",
  sheenShift = 0,
  style,
}) => {
  const k = width / PH.w;
  const height = PH.h * k;
  const radius = PH.radius * k;
  const m = PH.module;
  return (
    <div style={{ position: "relative", width, height, ...style }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          background: "#131211",
          boxShadow: "0 1px 1px rgba(0,0,0,.25), 0 18px 30px -12px rgba(0,0,0,.5), 0 50px 80px -30px rgba(0,0,0,.45)",
        }}
      >
        <Img src={staticFile(src)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition }} />
        {/* polycarbonate sheen, sliding as the case turns */}
        <div
          style={{
            position: "absolute",
            inset: "-30%",
            translate: `${sheenShift * 22}% 0`,
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 28%, transparent 44%, transparent 68%, rgba(255,255,255,0.12) 100%)",
          }}
        />
        {/* case lip */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: radius,
            boxShadow: "inset 0 0 0 3px rgba(10,10,10,.85), inset 0 0 0 5px rgba(255,255,255,.12)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: m.x * k,
            top: m.y * k,
            width: m.w * k,
            height: m.h * k,
            borderRadius: m.r * k,
            background: "rgba(18,18,18,0.84)",
            boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.16), 0 3px 8px rgba(0,0,0,0.4)",
          }}
        />
        {LENSES.map((l, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: (l.x - l.r) * k,
              top: (l.y - l.r) * k,
              width: l.r * 2 * k,
              height: l.r * 2 * k,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 38% 34%, rgba(120,140,170,.55) 0 8%, #0b0c10 22%, #050506 58%, #2a2a2c 64%, #0c0c0c 74%, #3b3b3d 100%)",
              boxShadow: "0 0 0 1px rgba(255,255,255,.08), 0 1px 3px rgba(0,0,0,.6)",
            }}
          />
        ))}
      </div>
    </div>
  );
};
