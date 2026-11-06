import React from "react";
import { AbsoluteFill, Img, staticFile, useVideoConfig } from "remotion";

/** Scene photos (public/scenes, metadata from src/data/scenes.json of the website). */
export const SCENES = {
  salon: { src: "scenes/salon.jpg", w: 2000, h: 1333, cmPerWidth: 435 },
  bureau: { src: "scenes/bureau.jpg", w: 2000, h: 1335, cmPerWidth: 185 },
  chambre: { src: "scenes/chambre.jpg", w: 2000, h: 1365, cmPerWidth: 435 },
  entree: { src: "scenes/entree.jpg", w: 2000, h: 1333, cmPerWidth: 290 },
  cafe: { src: "scenes/cafe.jpg", w: 2000, h: 1333, cmPerWidth: 185 },
} as const;
export type SceneId = keyof typeof SCENES;

export interface RoomProps {
  scene: SceneId;
  /** point on the photo (0..1) where the plate hangs */
  anchor: { x: number; y: number };
  /** where that point should land on screen (px) */
  at: { x: number; y: number };
  /** displayed photo height, px */
  height: number;
  zoom?: number;
  blur?: number;
  brightness?: number;
  offset?: { x: number; y: number };
  children?: React.ReactNode;
}

/**
 * A room photo cropped to the frame around a wall anchor. Children are positioned
 * relative to the anchor (place them with translate(-50%, -50%)), and zoom/shake
 * move the photo and the plates together.
 */
export const Room: React.FC<RoomProps> = ({
  scene,
  anchor,
  at,
  height,
  zoom = 1,
  blur = 0,
  brightness = 1,
  offset = { x: 0, y: 0 },
  children,
}) => {
  const { width: FW, height: FH } = useVideoConfig();
  const s = SCENES[scene];
  const dispH = Math.max(height, FH);
  const dispW = (s.w / s.h) * dispH;
  let left = at.x - anchor.x * dispW;
  let top = at.y - anchor.y * dispH;
  left = Math.min(0, Math.max(FW - dispW, left));
  top = Math.min(0, Math.max(FH - dispH, top));
  const ax = left + anchor.x * dispW;
  const ay = top + anchor.y * dispH;

  return (
    <AbsoluteFill style={{ overflow: "hidden", backgroundColor: "#000" }}>
      <AbsoluteFill
        style={{
          transformOrigin: `${ax}px ${ay}px`,
          scale: String(zoom),
          translate: `${offset.x}px ${offset.y}px`,
        }}
      >
        <Img
          src={staticFile(s.src)}
          style={{
            position: "absolute",
            left,
            top,
            width: dispW,
            height: dispH,
            filter: blur > 0 || brightness !== 1 ? `blur(${blur}px) brightness(${brightness})` : undefined,
          }}
        />
        <div style={{ position: "absolute", left: ax, top: ay, width: 0, height: 0 }}>{children}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** px per cm for a scene displayed at `height` px (to hang plates at true scale). */
export const pxPerCm = (scene: SceneId, height: number) => {
  const s = SCENES[scene];
  return ((s.w / s.h) * height) / s.cmPerWidth;
};
