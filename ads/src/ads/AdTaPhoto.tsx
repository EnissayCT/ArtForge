import React from "react";
import { AbsoluteFill, Img, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Audio } from "@remotion/media";
import { C, SAFE, display, label, semi } from "../theme";
import { clamp, glintAt, inOutQuart, outCubic, outExpo, prog, shake, snapState } from "../lib/anim";
import { Plate } from "../components/Plate";
import { Room } from "../components/Room";
import { Lockup, Mark, Wordmark } from "../components/Brand";
import { CaseMockup, PhoneFrame } from "../components/Phone";
import { Ink, Line, Paper, Rise, SafeZones } from "../components/ui";
import cues from "../cues.json";

export interface AdPhotoProps {
  brand: string;
  /** the "customer photo" (file in public/) — swap for a photo you have the rights to */
  photo: string;
  /** CSS object-position used for the 3:4 crop of that photo */
  photoPosition: string;
  safe?: boolean;
  [key: string]: unknown;
}

const B = cues.adB;
const PAD = `${SAFE.top + 24}px ${SAFE.side + 8}px 0`;

/* ------------------------------------------------------------------ */
/* 1 · Hook — a phone photo lifts out and turns into a metal plate     */
/* ------------------------------------------------------------------ */
const Hook: React.FC<{ brand: string; photo: string; pos: string }> = ({ brand, photo, pos }) => {
  const f = useCurrentFrame(); // 0..75
  const LAND = B.hookLand;
  const p = prog(f, 3, LAND, inOutQuart);
  const arc = Math.sin(Math.PI * p);

  // phone + photo geometry
  const PW = 500;
  const PHH = 1040;
  const phoneTop = 548;
  const screenW = PW - 2 * Math.round(PW * 0.028);
  const startW = screenW;
  const startH = (screenW * 4) / 3;
  const startCY = phoneTop + PHH / 2;
  const endW = 450;
  const endH = 600;
  const endCY = 988;
  const w = startW + (endW - startW) * p;
  const h = startH + (endH - startH) * p;
  const cy = startCY + (endCY - startCY) * p;

  // after landing: slow sway so the light keeps moving on the metal
  const t = Math.max(0, f - LAND);
  const settle = f >= LAND ? 1 + 0.03 * Math.exp(-t / 3) * Math.cos(t * 1.3) : 1;
  const swayY = f >= LAND ? interpolate(t, [0, 45], [0, 12], { easing: outCubic }) * Math.sin(t / 14) : 0;
  const ry = -38 * arc + swayY;
  const rx = 9 * arc + (f >= LAND ? 3 * Math.sin(t / 18) : 0);
  const tz = 260 * arc;
  const metal = prog(f, 10, 26);
  const radius = 6 * metal;

  const phoneOut = prog(f, 6, 22, (x) => x * x);
  const second = f >= LAND;
  const pop = prog(f, LAND, LAND + 7, outExpo);

  return (
    <Ink glow={{ x: 50, y: 50 }}>
      {/* phone with the photo opened full-screen */}
      <div
        style={{
          position: "absolute",
          left: 540 - PW / 2,
          top: phoneTop,
          opacity: 1 - phoneOut,
          translate: `0 ${phoneOut * 260}px`,
          scale: String(1 - 0.06 * phoneOut),
        }}
      >
        <PhoneFrame w={PW} h={PHH}>
          <div style={{ position: "absolute", inset: 0, background: "#050505" }} />
          {/* camera-roll strip */}
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 46, display: "flex", gap: 4, justifyContent: "center", opacity: 0.85 }}>
            {["scenes/salon.jpg", "scenes/chambre.jpg", photo, "scenes/entree.jpg", "scenes/bureau.jpg"].map((s, i) => (
              <Img
                key={i}
                src={staticFile(s)}
                style={{
                  width: 62,
                  height: 62,
                  objectFit: "cover",
                  outline: i === 2 ? "3px solid #fff" : undefined,
                  outlineOffset: -3,
                }}
              />
            ))}
          </div>
        </PhoneFrame>
      </div>

      {/* the photo → plate */}
      <div style={{ position: "absolute", inset: 0, perspective: 1600, perspectiveOrigin: "50% 50%" }}>
        <div
          style={{
            position: "absolute",
            left: 540 - w / 2,
            top: cy - h / 2,
            width: w,
            height: h,
            transformStyle: "preserve-3d",
            translate: `0 0 ${tz}px`,
            transform: `rotateY(${ry}deg) rotateX(${rx}deg) scale(${settle})`,
          }}
        >
          <Plate
            src={photo}
            objectPosition={pos}
            w={w}
            h={h}
            radius={radius}
            metal={metal}
            lift={0.25 + 0.6 * arc}
            shadow={1.8 * metal}
            glint={glintAt(f, 15, 22) ?? glintAt(f, 44, 26)}
            edgeAngle={135 + ry * 2}
          />
        </div>
      </div>

      <AbsoluteFill style={{ padding: PAD }}>
        <Lockup brand={brand} size={38} color={C.paper} />
        <div style={{ marginTop: 20 }}>
          <h1 style={display(180, C.paper)}>Ta photo,</h1>
          {second && (
            <div style={{ scale: String(1.08 - 0.08 * pop), transformOrigin: "0% 50%", opacity: clamp(pop * 3) }}>
              <h1 style={{ ...display(180, C.ember) }}>sur métal.</h1>
            </div>
          )}
        </div>
      </AbsoluteFill>
    </Ink>
  );
};

/* ------------------------------------------------------------------ */
/* 2 · The flow on the site: upload → crop → preview (75 → 165)        */
/* ------------------------------------------------------------------ */
const STEPS = [
  { n: "01", kicker: "Depuis ton téléphone", word: "Envoie." },
  { n: "02", kicker: "Choisis le format", word: "Cadre." },
  { n: "03", kicker: "Aperçu sur ton mur et en 3D", word: "Visualise." },
];

const AppHeader: React.FC<{ brand: string }> = ({ brand }) => (
  <div
    style={{
      position: "absolute",
      left: 0,
      right: 0,
      top: 64,
      height: 58,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0 34px",
      borderBottom: "1px solid rgba(19,18,17,0.1)",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Mark height={26} color={C.ink} />
      <Wordmark brand={brand} size={24} color={C.ink} />
    </div>
    <div style={{ display: "flex", gap: 6 }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 22, height: 2.5, background: C.ink, marginTop: i === 0 ? 0 : 3 }} />
      ))}
    </div>
  </div>
);

const ScreenUpload: React.FC<{ f: number; photo: string; pos: string }> = ({ f, photo, pos }) => {
  const TAP = B.tap - B.steps;
  const UP = B.upload - B.steps;
  const ripple = prog(f, TAP, TAP + 10, outCubic);
  const shown = prog(f, UP, UP + 7, outExpo);
  return (
    <>
      <div style={{ position: "absolute", left: 34, top: 150, ...semi(40, C.ink) }}>Imprime ta photo</div>
      <div style={{ position: "absolute", left: 34, top: 200, ...label(17, C.stone) }}>Plaque en métal · impression UV</div>
      <div
        style={{
          position: "absolute",
          left: 34,
          top: 244,
          right: 34,
          height: 450,
          borderRadius: 18,
          border: "3px dashed rgba(19,18,17,0.28)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          overflow: "hidden",
        }}
      >
        <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke={C.ink} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4M6.5 9.5 12 4l5.5 5.5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        <div style={{ ...semi(28, C.ink) }}>Choisir une photo</div>
        <div style={{ ...label(16, C.stone) }}>JPG · PNG · HEIC</div>
        {shown > 0 && (
          <Img
            src={staticFile(photo)}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: pos,
              opacity: shown,
              scale: String(1.08 - 0.08 * shown),
            }}
          />
        )}
      </div>
      {/* tap ripple on the drop zone */}
      {f >= TAP && f < TAP + 12 && (
        <div
          style={{
            position: "absolute",
            left: 236 - 60 * ripple,
            top: 470 - 60 * ripple,
            width: 120 * ripple + 16,
            height: 120 * ripple + 16,
            borderRadius: "50%",
            background: `rgba(228,87,46,${0.35 * (1 - ripple)})`,
            border: `3px solid rgba(228,87,46,${0.9 * (1 - ripple)})`,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          left: 34,
          right: 34,
          top: 716,
          height: 74,
          background: shown > 0.5 ? C.ink : "rgba(19,18,17,0.18)",
          color: C.paper,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...display(34, C.paper),
          lineHeight: 1,
        }}
      >
        Continuer →
      </div>
    </>
  );
};

const CROP_SIZES = ["20×30", "30×40", "40×60", "60×90"];

const ScreenCrop: React.FC<{ f: number; photo: string; pos: string }> = ({ f, photo, pos }) => {
  const p = prog(f, 2, 22, inOutQuart);
  const cw = 300 * (1.12 - 0.12 * p);
  const ch = cw * (4 / 3);
  const cx = 222 + (-40 + 40 * p);
  const cy = 420 + (30 - 30 * p);
  const sel = f < 12 ? 0 : 1;
  return (
    <>
      <div style={{ position: "absolute", left: 34, top: 150, ...semi(40, C.ink) }}>Cadrage</div>
      <div style={{ position: "absolute", left: 34, top: 214, right: 34, height: 440, overflow: "hidden", borderRadius: 14, background: "#000" }}>
        <Img src={staticFile(photo)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos }} />
        {/* dim outside the crop with a giant box-shadow */}
        <div
          style={{
            position: "absolute",
            left: cx - cw / 2 - 34 + 34,
            top: cy - ch / 2 - 214,
            width: cw,
            height: ch,
            boxShadow: "0 0 0 2000px rgba(10,9,8,0.55)",
            outline: "2px solid rgba(255,255,255,0.95)",
          }}
        >
          {/* thirds */}
          {[1, 2].map((i) => (
            <React.Fragment key={i}>
              <div style={{ position: "absolute", left: (cw / 3) * i, top: 0, bottom: 0, width: 1, background: "rgba(255,255,255,0.35)" }} />
              <div style={{ position: "absolute", top: (ch / 3) * i, left: 0, right: 0, height: 1, background: "rgba(255,255,255,0.35)" }} />
            </React.Fragment>
          ))}
          {[
            [0, 0],
            [1, 0],
            [0, 1],
            [1, 1],
          ].map(([x, y], i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: x ? cw - 30 : -4,
                top: y ? ch - 30 : -4,
                width: 34,
                height: 34,
                borderLeft: x ? undefined : "6px solid #fff",
                borderRight: x ? "6px solid #fff" : undefined,
                borderTop: y ? undefined : "6px solid #fff",
                borderBottom: y ? "6px solid #fff" : undefined,
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ position: "absolute", left: 34, right: 34, top: 676, display: "flex", gap: 10 }}>
        {CROP_SIZES.map((s, i) => (
          <div
            key={s}
            style={{
              flex: 1,
              height: 58,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${i === sel ? C.ink : "rgba(19,18,17,0.2)"}`,
              background: i === sel ? C.ink : "transparent",
              ...label(17, i === sel ? C.paper : C.ink),
              letterSpacing: "0.02em",
            }}
          >
            {s}
          </div>
        ))}
      </div>
    </>
  );
};

const ScreenPreview: React.FC<{ f: number; photo: string; pos: string }> = ({ f, photo, pos }) => {
  const s = snapState(f, 8, { dur: 6, dy: 90, s0: 1.35, rot0: -4, bounce: 0.8 });
  return (
    <>
      <div style={{ position: "absolute", left: 34, top: 150, ...semi(40, C.ink) }}>Sur ton mur</div>
      <div style={{ position: "absolute", left: 34, top: 214, right: 34, height: 440, overflow: "hidden", borderRadius: 14 }}>
        <Img
          src={staticFile("scenes/salon.jpg")}
          style={{ position: "absolute", left: -480, top: -150, height: 900, width: (900 * 2000) / 1333 }}
        />
        <div style={{ position: "absolute", left: 158, top: 56, translate: `${s.x}px ${s.y}px`, scale: String(s.scale), rotate: `${s.rot}deg`, opacity: s.opacity }}>
          <Plate src={photo} objectPosition={pos} w={102} h={136} radius={2} lift={s.lift} blur={s.blur * 0.4} shadow={1.2} glint={glintAt(f, 10, 14)} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 34, right: 34, top: 676, display: "flex", gap: 10 }}>
        {["Sur mon mur", "Vue 3D"].map((s2, i) => (
          <div
            key={s2}
            style={{
              flex: 1,
              height: 58,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${i === 0 ? C.ink : "rgba(19,18,17,0.2)"}`,
              background: i === 0 ? C.ink : "transparent",
              ...label(17, i === 0 ? C.paper : C.ink),
            }}
          >
            {s2}
          </div>
        ))}
      </div>
    </>
  );
};

const Steps: React.FC<{ brand: string; photo: string; pos: string }> = ({ brand, photo, pos }) => {
  const f = useCurrentFrame(); // 0..90
  const i = f < B.crop - B.steps ? 0 : f < B.preview - B.steps ? 1 : 2;
  const starts = [0, B.crop - B.steps, B.preview - B.steps];
  const lf = f - starts[i];
  const st = STEPS[i];
  const enter = prog(f, 0, 9, outExpo);
  return (
    <Paper>
      <div style={{ position: "absolute", left: 540 - 250, top: 610 + (1 - enter) * 260 }}>
        <PhoneFrame w={500} h={1040} screenBg={C.paper} dark={false}>
          <AppHeader brand={brand} />
          {i === 0 && <ScreenUpload f={lf} photo={photo} pos={pos} />}
          {i === 1 && <ScreenCrop f={lf} photo={photo} pos={pos} />}
          {i === 2 && <ScreenPreview f={lf} photo={photo} pos={pos} />}
        </PhoneFrame>
      </div>
      <AbsoluteFill style={{ padding: PAD }}>
        <div key={i}>
          <Line start={starts[i]} dur={6}>
            <p style={label(30, C.stone)}>
              <span style={{ color: C.emberDeep }}>{st.n}</span> · {st.kicker}
            </p>
          </Line>
          <Line start={starts[i] + 1} dur={7} style={{ marginTop: 12 }}>
            <h2 style={display(176)}>{st.word}</h2>
          </Line>
        </div>
      </AbsoluteFill>
    </Paper>
  );
};

/* ------------------------------------------------------------------ */
/* 3 · Real wall: the plate snaps on (165 → 240)                       */
/* ------------------------------------------------------------------ */
const WallSnap: React.FC<{ photo: string; pos: string }> = ({ photo, pos }) => {
  const f = useCurrentFrame();
  const SNAP = B.roomSnap - B.room;
  const s = snapState(f, SNAP, { dur: 14, dy: 460, dx: -140, s0: 1.6, rot0: 8 });
  const sh = shake(f, SNAP, 9);
  const zoom = interpolate(f, [0, SNAP, 75], [1.05, 1, 1.04], { easing: outCubic, extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <Room scene="bureau" anchor={{ x: 0.525, y: 0.425 }} at={{ x: 540, y: 816 }} height={1920} zoom={zoom} offset={sh}>
        <div style={{ position: "absolute", translate: `calc(-50% + ${s.x}px) calc(-50% + ${s.y}px)`, scale: String(s.scale), rotate: `${s.rot}deg`, opacity: s.opacity }}>
          <Plate src={photo} objectPosition={pos} w={466} h={622} lift={s.lift} blur={s.blur} glint={glintAt(f, SNAP + 4, 28)} />
        </div>
      </Room>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(241,238,232,0.6) 0%, rgba(241,238,232,0) 30%)" }} />
      <AbsoluteFill style={{ padding: PAD }}>
        <Line start={0} dur={6}>
          <p style={label(30, C.ink)}>Fixation aimantée</p>
        </Line>
        {f < SNAP ? (
          <Line start={1} dur={7} style={{ marginTop: 12 }}>
            <h2 style={display(150)}>Sans perçage.</h2>
          </Line>
        ) : (
          <div style={{ marginTop: 12 }}>
            <h2 style={display(150)}>
              Sans <span style={{ color: C.ember }}>perçage.</span>
            </h2>
          </div>
        )}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* 4 · Phone case (240 → 300)                                          */
/* ------------------------------------------------------------------ */
const Case: React.FC<{ photo: string; pos: string }> = ({ photo, pos }) => {
  const f = useCurrentFrame();
  const enter = prog(f, 0, 12, outExpo);
  const ry = interpolate(f, [0, 60], [-34, 14], { easing: outCubic });
  return (
    <Ink glow={{ x: 35, y: 60 }}>
      <AbsoluteFill style={{ padding: PAD }}>
        <Line start={0} dur={6}>
          <h2 style={display(150, C.paper)}>Et sur ta</h2>
        </Line>
        <Line start={2} dur={6}>
          <h2 style={display(150, C.ember)}>coque aussi.</h2>
        </Line>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 96, top: 640, perspective: 1400 }}>
        <div style={{ transform: `rotateY(${ry}deg) rotateX(4deg)`, translate: `${(1 - enter) * -240}px 0`, opacity: enter }}>
          <CaseMockup src={photo} objectPosition={pos} width={390} sheenShift={ry / 30} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 600, top: 700, width: 400 }}>
        <Rise start={8}>
          {["iPhone", "Samsung", "Xiaomi"].map((b) => (
            <p key={b} style={{ ...label(34, C.paper), lineHeight: 1.45, textTransform: "none" }}>
              {b}
            </p>
          ))}
        </Rise>
        <Rise start={14} style={{ marginTop: 44 }}>
          <p style={label(28, "rgba(241,238,232,0.6)")}>Coques dès</p>
          <h3 style={{ ...display(140, C.paper), marginTop: 10, whiteSpace: "nowrap" }}>
            149<span style={{ fontSize: 84, marginLeft: 10 }}>DH</span>
          </h3>
        </Rise>
      </div>
    </Ink>
  );
};

/* ------------------------------------------------------------------ */
/* 5 · Offer (300 → 375)                                               */
/* ------------------------------------------------------------------ */
const Offer: React.FC<{ photo: string; pos: string }> = ({ photo, pos }) => {
  const f = useCurrentFrame();
  const slam = prog(f, 0, 7, outExpo);
  return (
    <Paper>
      <AbsoluteFill style={{ padding: PAD }}>
        <Line start={0} dur={6}>
          <p style={label(32, C.stone)}>Ta photo sur métal · dès</p>
        </Line>
        <div style={{ marginTop: 10, scale: String(1.18 - 0.18 * slam), opacity: slam, transformOrigin: "0% 60%" }}>
          <h2 style={{ ...display(352, C.ink), whiteSpace: "nowrap" }}>
            190<span style={{ fontSize: 200, marginLeft: 18 }}>DH</span>
          </h2>
        </div>
        <div style={{ height: 2, background: "rgba(19,18,17,0.14)", marginTop: 36, width: prog(f, 6, 16, outExpo) * 936 }} />
        <Rise start={8} style={{ marginTop: 30 }}>
          <p style={{ ...semi(70, C.ember), textTransform: "uppercase" }}>Paiement à la livraison</p>
        </Rise>
        <Rise start={14} style={{ marginTop: 26 }}>
          <p style={label(30, C.ink)}>−15 % dès 3 plaques</p>
          <p style={{ ...label(30, C.ink), marginTop: 6 }}>Livraison offerte dès 500 DH</p>
        </Rise>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: SAFE.side + 8, top: 1006, display: "flex", alignItems: "flex-end", gap: 34, opacity: prog(f, 14, 24), translate: `0 ${(1 - prog(f, 14, 26, outExpo)) * 40}px` }}>
        <Plate src={photo} objectPosition={pos} w={174} h={232} radius={3} glint={glintAt(f, 28, 20)} />
        <CaseMockup src={photo} objectPosition={pos} width={111} />
        <div style={{ paddingBottom: 6 }}>
          <p style={label(24, C.stone)}>Plaque 30×40</p>
          <p style={{ ...semi(40, C.ink), marginTop: 4 }}>250 DH</p>
          <p style={{ ...label(24, C.stone), marginTop: 18 }}>Coque dès</p>
          <p style={{ ...semi(40, C.ink), marginTop: 4 }}>149 DH</p>
        </div>
      </div>
    </Paper>
  );
};

/* ------------------------------------------------------------------ */
/* 6 · End card (375 → 450)                                            */
/* ------------------------------------------------------------------ */
const EndCard: React.FC<{ brand: string }> = ({ brand }) => {
  const f = useCurrentFrame();
  const glint = prog(f, 6, 30, inOutQuart);
  return (
    <Ink glow={{ x: 50, y: 40 }}>
      <AbsoluteFill style={{ padding: `${SAFE.top + 40}px ${SAFE.side + 8}px 0`, alignItems: "center" }}>
        <Rise start={0} dur={8}>
          <Lockup brand={brand} size={66} color={C.paper} glint={glint} />
        </Rise>
        <div style={{ marginTop: 92, textAlign: "center" }}>
          <Line start={3} dur={7}>
            <h2 style={display(196, C.paper)}>Imprime</h2>
          </Line>
          <Line start={5} dur={7}>
            <h2 style={{ ...display(196, C.ember) }}>ta photo.</h2>
          </Line>
        </div>
        <Rise start={10} dur={8} style={{ marginTop: 64 }}>
          <div style={{ background: C.paper, padding: "30px 56px", borderRadius: 2, display: "flex", alignItems: "center", gap: 26 }}>
            <span style={{ ...display(60, C.ink), lineHeight: 1 }}>Commander</span>
            <span style={{ ...display(60, C.ember), lineHeight: 1 }}>→</span>
          </div>
        </Rise>
        <Rise start={14} dur={8} style={{ marginTop: 48, textAlign: "center" }}>
          <p style={label(30, C.paper)}>Paiement à la livraison</p>
          <p style={{ ...label(30, "rgba(241,238,232,0.6)"), marginTop: 6 }}>Livraison partout au Maroc</p>
        </Rise>
      </AbsoluteFill>
    </Ink>
  );
};

/* ------------------------------------------------------------------ */
export const AdTaPhoto: React.FC<AdPhotoProps> = ({ brand, photo, photoPosition, safe }) => {
  return (
    <AbsoluteFill style={{ backgroundColor: C.ink }}>
      <Sequence name="Hook" from={0} durationInFrames={B.steps}>
        <Hook brand={brand} photo={photo} pos={photoPosition} />
      </Sequence>
      <Sequence name="Étapes" from={B.steps} durationInFrames={B.room - B.steps}>
        <Steps brand={brand} photo={photo} pos={photoPosition} />
      </Sequence>
      <Sequence name="Mur" from={B.room} durationInFrames={B.case - B.room}>
        <WallSnap photo={photo} pos={photoPosition} />
      </Sequence>
      <Sequence name="Coque" from={B.case} durationInFrames={B.offer - B.case}>
        <Case photo={photo} pos={photoPosition} />
      </Sequence>
      <Sequence name="Offre" from={B.offer} durationInFrames={B.end - B.offer}>
        <Offer photo={photo} pos={photoPosition} />
      </Sequence>
      <Sequence name="Fin" from={B.end} durationInFrames={450 - B.end}>
        <EndCard brand={brand} />
      </Sequence>
      <Audio src={staticFile("audio/ad-b.wav")} />
      {safe && <SafeZones />}
    </AbsoluteFill>
  );
};
