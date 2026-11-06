import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Plate, SteelSheet } from "../components/Plate";
import { Room } from "../components/Room";
import { Ink } from "../components/ui";
import { glintAt, releaseState, shake, snapState } from "../lib/anim";

/**
 * Site loop 1 — a plate floating in the dark, tilting slowly in 3D while the light
 * slides over it. Every motion is periodic over the composition, so it loops seamlessly.
 */
export const LoopGlint: React.FC<{ art?: string }> = ({ art = "art/zellige-fes.jpg" }) => {
  const f = useCurrentFrame();
  const { durationInFrames: T, width, height } = useVideoConfig();
  const a = (2 * Math.PI * f) / T;
  const ry = 14 * Math.sin(a);
  const rx = 5 * Math.cos(a);
  const ty = 10 * Math.sin(2 * a);
  const W = 600;
  const H = 800;
  const sweep = glintAt(f, Math.round(T * 0.3), Math.round(T * 0.3));
  return (
    <Ink glow={{ x: 50, y: 46 }}>
      {/* soft shadow on the backdrop, sliding opposite to the tilt */}
      <div
        style={{
          position: "absolute",
          left: width / 2 - W / 2 - ry * 3.2,
          top: height / 2 - H / 2 + 46 + ty * 0.4,
          width: W,
          height: H,
          borderRadius: 30,
          background: "rgba(0,0,0,0.75)",
          filter: "blur(46px)",
        }}
      />
      <AbsoluteFill style={{ perspective: 1900 }}>
        <div
          style={{
            position: "absolute",
            left: width / 2 - W / 2,
            top: height / 2 - H / 2 + ty,
            transform: `rotateY(${ry.toFixed(3)}deg) rotateX(${rx.toFixed(3)}deg)`,
          }}
        >
          <Plate
            src={art}
            w={W}
            h={H}
            radius={6}
            boxShadow="0 1px 1px rgba(0,0,0,0.4), 0 30px 60px -20px rgba(0,0,0,0.7)"
            glint={sweep}
            edgeAngle={135 + ry * 4}
            specular={0.35}
          />
          {/* ambient reflection that follows the tilt */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 6,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: "-30%",
                translate: `${(-ry * 2.2).toFixed(2)}% ${(rx * 2).toFixed(2)}%`,
                background: "linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.16) 46%, rgba(255,255,255,0) 62%)",
                mixBlendMode: "screen",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </Ink>
  );
};

/**
 * Site loop 2 — empty wall with the adhesive steel sheet, the plate flies in and snaps
 * on, catches the light, then lifts off again so the loop starts on the empty wall.
 */
export const LoopSnap: React.FC<{ art?: string }> = ({ art = "art/zellige-chefchaouen.jpg" }) => {
  const f = useCurrentFrame();
  const { durationInFrames: T } = useVideoConfig();
  const SNAP = 36;
  const RELEASE = T - 38;
  const s = f < RELEASE ? snapState(f, SNAP, { dur: 15, dy: 420, dx: 160, s0: 1.7, rot0: -8 }) : releaseState(f, RELEASE, { dur: 18, dy: -380, dx: 220, s0: 1.6, rot0: 7 });
  const sh = shake(f, SNAP, 7);
  const zoom = 1.025 + 0.02 * Math.sin((2 * Math.PI * f) / T);
  const W = 372;
  const H = 558;
  return (
    <AbsoluteFill>
      <Room scene="salon" anchor={{ x: 0.5, y: 0.29 }} at={{ x: 540, y: 522 }} height={1800} zoom={zoom} offset={sh} blur={0.6}>
        <div style={{ position: "absolute", translate: "-50% -50%" }}>
          <SteelSheet w={150} h={100} />
        </div>
        <div
          style={{
            position: "absolute",
            translate: `calc(-50% + ${s.x}px) calc(-50% + ${s.y}px)`,
            scale: String(s.scale),
            rotate: `${s.rot}deg`,
            opacity: s.opacity,
          }}
        >
          <Plate src={art} w={W} h={H} lift={s.lift} blur={s.blur} radius={5} glint={glintAt(f, SNAP + 22, 30) ?? glintAt(f, SNAP + 95, 30)} />
        </div>
      </Room>
    </AbsoluteFill>
  );
};
