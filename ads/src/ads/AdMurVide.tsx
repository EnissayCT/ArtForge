import React from "react";
import { AbsoluteFill, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, SAFE, display, label, semi } from "../theme";
import { glintAt, inOutQuart, outCubic, outExpo, prog, shake, snapState } from "../lib/anim";
import { Plate, SteelSheet } from "../components/Plate";
import { Room, SceneId } from "../components/Room";
import { Lockup } from "../components/Brand";
import { Ink, Line, Paper, Rise, SafeZones, ShineText } from "../components/ui";
import cues from "../cues.json";

export interface AdProps {
  brand: string;
  safe?: boolean;
  [key: string]: unknown;
}

const A = cues.adA;

/* ------------------------------------------------------------------ */
/* 1 · Hook — bare wall, the plate flies in and snaps (0 → 75)          */
/* ------------------------------------------------------------------ */
const Hook: React.FC<{ brand: string }> = ({ brand }) => {
  const f = useCurrentFrame();
  const SNAP = A.hookSnap;
  const s = snapState(f, SNAP, { dur: 17, dy: 520, dx: 120, s0: 1.75, rot0: -9 });
  const sh = shake(f, SNAP, 9);
  const zoom = f < SNAP ? interpolate(f, [0, SNAP], [1.035, 1]) : interpolate(f, [SNAP, 75], [1, 1.05], { easing: outCubic, extrapolateRight: "clamp" });
  const W = 359;
  const H = 538;
  const outline = 1 - prog(f, SNAP - 3, SNAP);
  const after = f >= SNAP;
  const pop = prog(f, SNAP, SNAP + 6, outExpo);

  return (
    <AbsoluteFill>
      <Room scene="salon" anchor={{ x: 0.5, y: 0.3408 }} at={{ x: 540, y: 886 }} height={2600} zoom={zoom} offset={sh} blur={0.8}>
        {/* the empty spot, measured like a plan */}
        <div
          style={{
            position: "absolute",
            left: -W / 2,
            top: -H / 2,
            width: W,
            height: H,
            opacity: outline,
            border: "3px dashed rgba(19,18,17,0.42)",
            borderRadius: 4,
          }}
        >
          <div style={{ ...label(28, "rgba(19,18,17,0.6)"), position: "absolute", left: 0, right: 0, top: H / 2 - 18, textAlign: "center" }}>
            40 × 60 cm
          </div>
        </div>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            translate: `calc(-50% + ${s.x}px) calc(-50% + ${s.y}px)`,
            scale: String(s.scale),
            rotate: `${s.rot}deg`,
            opacity: s.opacity,
          }}
        >
          <Plate src="art/zellige-fes.jpg" w={W} h={H} lift={s.lift} blur={s.blur} glint={glintAt(f, SNAP + 3, 28)} radius={5} />
        </div>
      </Room>

      {/* copy */}
      <AbsoluteFill style={{ padding: `${SAFE.top + 24}px ${SAFE.side + 8}px 0` }}>
        {!after ? (
          <div>
            <h1 style={display(178)}>Ton mur</h1>
            <h1 style={{ ...display(178), color: C.ember }}>est vide ?</h1>
          </div>
        ) : (
          <div style={{ scale: String(1.06 - 0.06 * pop), transformOrigin: "0% 0%" }}>
            <Lockup brand={brand} size={38} color={C.ink} style={{ marginBottom: 22, opacity: prog(f, SNAP + 8, SNAP + 16) }} />
            <h1 style={display(178)}>
              <span style={{ color: C.ember }}>Zéro</span> trou.
            </h1>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 2 · How it holds — steel sheet, then the plate clicks on (75 → 145)  */
/* ------------------------------------------------------------------ */
const Mechanism: React.FC = () => {
  const f = useCurrentFrame(); // local, 0 = frame 75
  const STEEL = A.steel - 75;
  const SNAP = A.mechSnap - 75;
  const steelP = prog(f, STEEL - 8, STEEL, (t) => t * t);
  const steelZ = 140 * (1 - steelP);
  const steelSettle = f >= STEEL ? 1 - 0.02 * Math.exp(-(f - STEEL) / 2.5) * Math.cos((f - STEEL) * 1.3) : 1;

  const flight = 13;
  const p = prog(f, SNAP - flight, SNAP);
  const e = Math.pow(p, 2.3);
  // approach along the camera axis (not the wall normal): offset in wall x as well as z
  const z = f < SNAP ? 380 * (1 - e) : 0;
  const ax = f < SNAP ? 700 * (1 - e) : 0;
  const t = f - SNAP;
  const bounceZ = f >= SNAP ? 6 * Math.exp(-t / 2.6) * Math.cos(t * 1.4) : 0;
  const posterZ = z + bounceZ + 2;
  const posterOn = f >= SNAP - flight;
  const posterBlur = f < SNAP ? Math.min(6, 8 * Math.pow(p, 1.5)) * (p > 0.1 ? 1 : 0) : 0;

  const ry = interpolate(f, [0, 70], [-38, -18], { easing: inOutQuart });
  const camShake = shake(f, SNAP, 8);
  const sh = shake(f, STEEL, 3);

  const PW = 450;
  const PH = 600;
  const CX = 1200;
  const CY = 1160;
  // contact shadow cast on the wall by the plate (light from upper left)
  const zs = Math.max(0, posterZ);
  const shadowOp = posterOn ? 0.5 / (1 + zs / 220) : 0;

  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #cdb79e 0%, #b59c82 60%, #9c8269 100%)" }}>
      <AbsoluteFill style={{ perspective: 1400, perspectiveOrigin: "50% 42%", translate: `${camShake.x + sh.x}px ${camShake.y + sh.y}px` }}>
        <div
          style={{
            position: "absolute",
            left: 540 - CX,
            top: 860 - CY,
            width: 2400,
            height: 2060,
            transformStyle: "preserve-3d",
            transformOrigin: `${CX}px ${CY}px`,
            rotate: `0 1 0 ${ry}deg`,
            background:
              "radial-gradient(ellipse 55% 40% at 42% 52%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0) 70%), linear-gradient(90deg, #e2d4c8 0%, #ece2d8 40%, #e6d9cd 70%, #d6c5b7 100%)",
          }}
        >
          {/* baseboard: its slant gives the viewing angle away */}
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: 2400,
              height: 70,
              background: "linear-gradient(180deg, #faf7f2 0%, #efe9e1 100%)",
              boxShadow: "0 -3px 6px rgba(80,55,40,0.12)",
              translate: "0 0 1px",
            }}
          />
          {/* steel sheet */}
          <div
            style={{
              position: "absolute",
              left: CX - 190,
              top: CY - 125,
              transformStyle: "preserve-3d",
              translate: `0 0 ${steelZ + 1}px`,
              scale: String(steelSettle),
              opacity: prog(f, STEEL - 8, STEEL - 5),
            }}
          >
            <SteelSheet w={380} h={250} lift={steelZ / 140} />
          </div>
          {/* label for the steel sheet */}
          <div
            style={{
              position: "absolute",
              left: CX - 190,
              top: CY + 125 + 26,
              opacity: prog(f, STEEL + 2, STEEL + 8) * (1 - prog(f, SNAP - 6, SNAP - 2)),
              translate: "0 0 1px",
            }}
          >
            <div style={{ width: 2, height: 34, background: C.ink, marginLeft: 0 }} />
            <div style={{ ...label(36, C.ink), lineHeight: 1.2, marginTop: 10, whiteSpace: "nowrap" }}>Plaque acier adhésive</div>
          </div>
          {/* cast shadow */}
          <div
            style={{
              position: "absolute",
              left: CX - PW / 2 + zs * 0.22 + ax,
              top: CY - PH / 2 + zs * 0.3,
              width: PW,
              height: PH,
              borderRadius: 8,
              background: "rgba(40,25,15,1)",
              opacity: shadowOp,
              filter: `blur(${(8 + zs * 0.09).toFixed(1)}px)`,
              translate: "0 0 0.5px",
            }}
          />
          {/* the plate (+ its metal edge, visible from this angle) */}
          {posterOn && (
            <div
              style={{
                position: "absolute",
                left: CX - PW / 2,
                top: CY - PH / 2,
                transformStyle: "preserve-3d",
                translate: `${ax.toFixed(2)}px 0 ${posterZ.toFixed(2)}px`,
                rotate: `${(f < SNAP ? -5 * (1 - e) : 0).toFixed(2)}deg`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: PW - 1,
                  top: 3,
                  width: 9,
                  height: PH - 6,
                  transformOrigin: "0 50%",
                  rotate: "0 1 0 90deg",
                  background: "linear-gradient(180deg, #e9ecef 0%, #b7bcc1 50%, #8e9398 100%)",
                }}
              />
              <Plate
                src="art/zellige-majorelle.jpg"
                w={PW}
                h={PH}
                lift={0}
                shadow={0.45}
                blur={posterBlur}
                glint={glintAt(f, SNAP + 2, 24)}
                edgeAngle={120}
              />
            </div>
          )}
        </div>
      </AbsoluteFill>

      <AbsoluteFill style={{ padding: `${SAFE.top + 24}px ${SAFE.side + 8}px 0` }}>
        {f < SNAP ? (
          <div>
            <Line start={0} dur={6}>
              <p style={label(32, C.ink)}>01 — Elle se colle</p>
            </Line>
            <Line start={2} dur={7} style={{ marginTop: 14 }}>
              <h2 style={display(178)}>Colle.</h2>
            </Line>
          </div>
        ) : (
          <div>
            <p style={label(32, C.ink)}>02 — L&apos;affiche s&apos;aimante</p>
            <div style={{ marginTop: 14, scale: String(1.1 - 0.1 * prog(f, SNAP, SNAP + 6, outExpo)), transformOrigin: "0% 50%" }}>
              <h2 style={{ ...display(178), color: C.ember }}>Clac.</h2>
            </div>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 3 · Quick-cut gallery, one plate per beat (145 → 240)                */
/* ------------------------------------------------------------------ */
interface Cut {
  scene: SceneId;
  anchor: { x: number; y: number };
  height: number;
  y: number;
  art: string;
  w: number;
  h: number;
  word: string;
  kicker: string;
  tone: "light" | "dark";
  from: { dx: number; dy: number; rot: number };
  objectPosition?: string;
  accent?: boolean;
}

const CUTS: Cut[] = [
  { scene: "cafe", anchor: { x: 0.45, y: 0.373 }, height: 2200, y: 820, art: "art/zellige-majorelle.jpg", w: 357, h: 476, word: "Majorelle.", kicker: "Zellige · création de l'atelier", tone: "light", from: { dx: -260, dy: 300, rot: -8 } },
  { scene: "bureau", anchor: { x: 0.24, y: 0.42 }, height: 1920, y: 800, art: "art/la-grande-vague.jpg", w: 600, h: 404, word: "Hokusai.", kicker: "Estampe japonaise · 1831", tone: "light", from: { dx: 280, dy: 260, rot: 7 } },
  { scene: "entree", anchor: { x: 0.32, y: 0.29 }, height: 2600, y: 760, art: "art/les-piliers-de-la-creation.jpg", w: 402, h: 536, word: "L'espace.", kicker: "NASA · télescope Webb", tone: "dark", from: { dx: 0, dy: 420, rot: -5 } },
  { scene: "chambre", anchor: { x: 0.65, y: 0.308 }, height: 2600, y: 800, art: "art/la-nuit-etoilee.jpg", w: 560, h: 420, word: "Van Gogh.", kicker: "Grands maîtres · 1889", tone: "dark", from: { dx: -300, dy: 240, rot: -7 } },
  { scene: "salon", anchor: { x: 0.4, y: 0.332 }, height: 2300, y: 764, art: "art/zellige-chefchaouen.jpg", w: 317, h: 476, word: "Chefchaouen.", kicker: "Zellige · création de l'atelier", tone: "light", from: { dx: 260, dy: 320, rot: 8 } },
  { scene: "bureau", anchor: { x: 0.3, y: 0.36 }, height: 2300, y: 830, art: "scenes/cafe.jpg", w: 420, h: 560, word: "Ta photo.", kicker: "Imprime ta propre photo", tone: "light", from: { dx: 0, dy: 380, rot: -6 }, objectPosition: "62% 50%", accent: true },
];

const GalleryCut: React.FC<{ cut: Cut; land: number }> = ({ cut, land }) => {
  const f = useCurrentFrame();
  const s = snapState(f, land, { dur: 6, dx: cut.from.dx, dy: cut.from.dy, s0: 1.5, rot0: cut.from.rot, bounce: 0.9 });
  const zoom = interpolate(f, [0, 20], [1.06, 1], { easing: outCubic, extrapolateRight: "clamp" });
  const sh = shake(f, land, 6);
  const ink = cut.tone === "light";
  return (
    <AbsoluteFill>
      <Room scene={cut.scene} anchor={cut.anchor} at={{ x: 540, y: cut.y }} height={cut.height} zoom={zoom} offset={sh}>
        <div
          style={{
            position: "absolute",
            translate: `calc(-50% + ${s.x}px) calc(-50% + ${s.y}px)`,
            scale: String(s.scale),
            rotate: `${s.rot}deg`,
            opacity: s.opacity,
          }}
        >
          <Plate
            src={cut.art}
            w={cut.w}
            h={cut.h}
            lift={s.lift}
            blur={s.blur}
            shadow={ink ? 1 : 1.6}
            glint={glintAt(f, land + 1, 16)}
            objectPosition={cut.objectPosition}
          />
        </div>
      </Room>
      {!ink && (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,9,8,0.55) 0%, rgba(10,9,8,0) 34%)" }} />
      )}
      {ink && (
        <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(241,238,232,0.55) 0%, rgba(241,238,232,0) 32%)" }} />
      )}
      <AbsoluteFill style={{ padding: `${SAFE.top + 24}px ${SAFE.side + 8}px 0` }}>
        <p style={label(28, ink ? C.ink : C.paper)}>{cut.kicker}</p>
        <h2 style={{ ...display(150), marginTop: 14, color: cut.accent ? C.ember : ink ? C.ink : C.paper }}>{cut.word}</h2>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 4 · Sizes to scale (240 → 285)                                      */
/* ------------------------------------------------------------------ */
const SIZES = [
  { w: 20, h: 30, label: "20×30", price: "190 DH" },
  { w: 30, h: 40, label: "30×40", price: "250 DH", top: true },
  { w: 40, h: 60, label: "40×60", price: "390 DH" },
  { w: 60, h: 90, label: "60×90", price: "690 DH" },
];

const Sizes: React.FC = () => {
  const f = useCurrentFrame();
  const k = 5.5;
  const gap = 34;
  const total = SIZES.reduce((a, s) => a + s.w * k, 0) + gap * (SIZES.length - 1);
  let x = (1080 - total) / 2;
  const base = 1050;
  return (
    <Paper color={C.paper2}>
      <AbsoluteFill style={{ padding: `${SAFE.top + 24}px ${SAFE.side + 8}px 0` }}>
        <Line start={0} dur={6}>
          <p style={label(30, C.stone)}>4 formats · prix fixes</p>
        </Line>
        <Line start={1} dur={7} style={{ marginTop: 14 }}>
          <h2 style={display(170)}>À ta taille.</h2>
        </Line>
      </AbsoluteFill>
      {SIZES.map((s, i) => {
        const w = s.w * k;
        const h = s.h * k;
        const left = x;
        x += w + gap;
        const land = 4 + i * 4;
        const st = snapState(f, land, { dur: 5, dy: 140, dx: 0, s0: 1.25, rot0: 0, bounce: 0.7 });
        return (
          <React.Fragment key={s.label}>
            <div
              style={{
                position: "absolute",
                left,
                top: base - h,
                translate: `${st.x}px ${st.y}px`,
                scale: String(st.scale),
                opacity: st.opacity,
              }}
            >
              <Plate src="art/zellige-nuit.jpg" w={w} h={h} lift={st.lift} blur={st.blur} radius={3} glint={glintAt(f, 22 + i * 3, 16)} />
            </div>
            {s.top && (
              <div style={{ position: "absolute", left, top: base - h - 52, width: 260, opacity: prog(f, 18, 24) }}>
                <p style={{ ...label(22, C.emberDeep), whiteSpace: "nowrap" }}>● Le plus choisi</p>
              </div>
            )}
            <div style={{ position: "absolute", left, top: base + 22, width: Math.max(w, 120), opacity: prog(f, land + 2, land + 8) }}>
              <p style={label(24, C.stone)}>{s.label}</p>
              <p style={{ ...semi(38, C.ink), marginTop: 6, whiteSpace: "nowrap" }}>{s.price}</p>
            </div>
          </React.Fragment>
        );
      })}
    </Paper>
  );
};

/* ------------------------------------------------------------------ */
/* 5 · Finishes (285 → 330)                                            */
/* ------------------------------------------------------------------ */
const FINISHES = [
  { id: "mat" as const, label: "Mat" },
  { id: "gloss" as const, label: "Brillant" },
  { id: "brushed" as const, label: "Métal brossé" },
];

const Finishes: React.FC = () => {
  const f = useCurrentFrame();
  const w = 276;
  const h = 368;
  const gap = 28;
  const left0 = (1080 - (3 * w + 2 * gap)) / 2;
  return (
    <Ink glow={{ x: 50, y: 48 }}>
      <AbsoluteFill style={{ padding: `${SAFE.top + 24}px ${SAFE.side + 8}px 0` }}>
        <Line start={0} dur={6}>
          <h2 style={display(140, C.paper)}>Mat, brillant</h2>
        </Line>
        <Line start={2} dur={6}>
          <h2 style={display(140, C.paper)}>
            ou <span style={{ color: C.brass }}>brossé.</span>
          </h2>
        </Line>
      </AbsoluteFill>
      {FINISHES.map((fi, i) => {
        const r = prog(f, 2 + i * 3, 12 + i * 3, outExpo);
        return (
          <div key={fi.id} style={{ position: "absolute", left: left0 + i * (w + gap), top: 640, opacity: r, translate: `0 ${(1 - r) * 60}px` }}>
            <Plate
              src="art/la-grande-vague.jpg"
              objectPosition="18% 50%"
              w={w}
              h={h}
              finish={fi.id}
              shadow={1.8}
              radius={4}
              specular={fi.id === "gloss" ? 1 : 0}
              glint={fi.id === "mat" ? null : glintAt(f, 12 + i * 6, 22)}
            />
            <p style={{ ...label(26, C.paper), marginTop: 24 }}>{fi.label}</p>
          </div>
        );
      })}
      <AbsoluteFill style={{ top: 1140, padding: `0 ${SAFE.side + 8}px` }}>
        <Rise start={14}>
          <p style={label(28, "rgba(241,238,232,0.62)")}>+ Cadre chêne ou noir en option</p>
        </Rise>
      </AbsoluteFill>
    </Ink>
  );
};

/* ------------------------------------------------------------------ */
/* 6 · Offer (330 → 390)                                               */
/* ------------------------------------------------------------------ */
const STRIP = [
  "art/zellige-marrakech.jpg",
  "art/la-grande-vague.jpg",
  "art/zellige-chefchaouen.jpg",
  "art/les-piliers-de-la-creation.jpg",
  "art/zellige-fes.jpg",
  "art/la-nuit-etoilee.jpg",
  "art/zellige-nuit.jpg",
  "art/zellige-majorelle.jpg",
];

export const PlateStrip: React.FC<{ y: number; h?: number; speed?: number; shadow?: number }> = ({ y, h = 150, speed = 2.2, shadow = 1.6 }) => {
  const f = useCurrentFrame();
  const w = h * 0.75;
  const gap = 26;
  return (
    <div style={{ position: "absolute", left: 0, top: y, width: 1080, height: h + 60, overflow: "visible" }}>
      <div style={{ display: "flex", gap, translate: `${-f * speed - 40}px 0` }}>
        {STRIP.map((src) => (
          <Plate key={src} src={src} w={w} h={h} radius={3} shadow={shadow} />
        ))}
      </div>
    </div>
  );
};

const Offer: React.FC = () => {
  const f = useCurrentFrame();
  const slam = prog(f, 0, 7, outExpo);
  return (
    <Ink glow={{ x: 50, y: 36 }}>
      <AbsoluteFill style={{ padding: `${SAFE.top + 24}px ${SAFE.side + 8}px 0` }}>
        <Line start={0} dur={6}>
          <p style={label(32, "rgba(241,238,232,0.7)")}>Affiches en métal · dès</p>
        </Line>
        <div style={{ marginTop: 10, scale: String(1.18 - 0.18 * slam), opacity: slam, transformOrigin: "0% 60%", position: "relative" }}>
          <h2 style={{ ...display(352, C.paper), whiteSpace: "nowrap" }}>
            <ShineText pos={glintAt(f, 8, 30)}>
              190<span style={{ fontSize: 200, marginLeft: 18 }}>DH</span>
            </ShineText>
          </h2>
        </div>
        <div style={{ height: 2, background: "rgba(241,238,232,0.18)", marginTop: 36, width: prog(f, 6, 16, outExpo) * 936 }} />
        <Rise start={8} style={{ marginTop: 30 }}>
          <p style={{ ...semi(70, C.ember), textTransform: "uppercase" }}>Paiement à la livraison</p>
        </Rise>
        <Rise start={14} style={{ marginTop: 26 }}>
          <p style={label(30, C.paper)}>−15 % dès 3 plaques</p>
          <p style={{ ...label(30, C.paper), marginTop: 6 }}>Livraison offerte dès 500 DH</p>
        </Rise>
      </AbsoluteFill>
      <div style={{ opacity: prog(f, 10, 20) }}>
        <PlateStrip y={1090} h={150} speed={2.4} />
      </div>
    </Ink>
  );
};

/* ------------------------------------------------------------------ */
/* 7 · End card (390 → 450)                                            */
/* ------------------------------------------------------------------ */
const EndCard: React.FC<{ brand: string; cta1: string; cta2: string }> = ({ brand, cta1, cta2 }) => {
  const f = useCurrentFrame();
  const glint = prog(f, 6, 30, inOutQuart);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: `${SAFE.top + 40}px ${SAFE.side + 8}px 0`, alignItems: "center" }}>
        <Rise start={0} dur={8}>
          <Lockup brand={brand} size={66} color={C.ink} glint={glint} />
        </Rise>
        <div style={{ marginTop: 92, textAlign: "center" }}>
          <Line start={3} dur={7}>
            <h2 style={display(196)}>{cta1}</h2>
          </Line>
          <Line start={5} dur={7}>
            <h2 style={{ ...display(196), color: C.ember }}>{cta2}</h2>
          </Line>
        </div>
        <Rise start={10} dur={8} style={{ marginTop: 64 }}>
          <div
            style={{
              background: C.ink,
              color: C.paper,
              padding: "30px 56px",
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 26,
            }}
          >
            <span style={{ ...display(60, C.paper), lineHeight: 1 }}>Commander</span>
            <span style={{ ...display(60, C.ember), lineHeight: 1 }}>→</span>
          </div>
        </Rise>
        <Rise start={14} dur={8} style={{ marginTop: 48, textAlign: "center" }}>
          <p style={label(30, C.ink)}>Paiement à la livraison</p>
          <p style={{ ...label(30, C.stone), marginTop: 6 }}>Livraison partout au Maroc</p>
        </Rise>
      </AbsoluteFill>
    </Paper>
  );
};

/* ------------------------------------------------------------------ */
export const AdMurVide: React.FC<AdProps> = ({ brand, safe }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Sequence name="Hook" from={0} durationInFrames={75}>
        <Hook brand={brand} />
      </Sequence>
      <Sequence name="Mécanisme" from={75} durationInFrames={70}>
        <Mechanism />
      </Sequence>
      {CUTS.map((cut, i) => {
        const from = A.galleryLands[i] - 5;
        const next = i < CUTS.length - 1 ? A.galleryLands[i + 1] - 5 : A.sizes;
        return (
          <Sequence key={cut.word} name={`Galerie ${cut.word}`} from={from} durationInFrames={next - from}>
            <GalleryCut cut={cut} land={5} />
          </Sequence>
        );
      })}
      <Sequence name="Tailles" from={A.sizes} durationInFrames={A.finishes - A.sizes}>
        <Sizes />
      </Sequence>
      <Sequence name="Finitions" from={A.finishes} durationInFrames={A.offer - A.finishes}>
        <Finishes />
      </Sequence>
      <Sequence name="Offre" from={A.offer} durationInFrames={A.end - A.offer}>
        <Offer />
      </Sequence>
      <Sequence name="Fin" from={A.end} durationInFrames={450 - A.end}>
        <EndCard brand={brand} cta1="Choisis" cta2="la tienne." />
      </Sequence>
      <Audio src={staticFile("audio/ad-a.wav")} />
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};

