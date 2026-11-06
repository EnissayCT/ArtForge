"use client";
/* eslint-disable react-hooks/immutability -- three.js scene objects are mutated in effects and the frame loop, never during React render */

import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { FinishLook } from "@/lib/pricing";
import {
  StudioEnvironment,
  planarShapeGeometry,
  roundedRectShape,
  useBackTexture,
  useCoverTexture,
  useGlintMaterial,
  useIntroMotion,
} from "./common";
import { buildPrintMaps, orangePeel } from "./printSurface";

export interface PlateViewerProps {
  image: string;
  /** cm, already oriented */
  dims: { w: number; h: number };
  finish?: FinishLook;
  /** frame colour, omit for no frame */
  frameColor?: string;
  background?: "ink" | "paper";
  brand?: string;
}

const U = 0.1; // 1 scene unit = 10 cm
const THICK = 0.01; // 1 mm steel plate
const BEVEL = 0.0007; // rolled edge that catches the light
const RADIUS = 0.035; // 3.5 mm rounded corners

/** Physical parameters of the UV-printed surface, per finish. */
function surfaceProps(look: FinishLook): THREE.MeshPhysicalMaterialParameters {
  switch (look) {
    case "brillant":
      // cured ink under a UV gloss varnish
      return {
        roughness: 1,
        metalness: 1,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        clearcoatNormalScale: new THREE.Vector2(0.22, 0.22),
        envMapIntensity: 0.8,
        normalScale: new THREE.Vector2(0.16, 0.16),
      };
    case "brosse":
      // ink printed straight on brushed aluminium: light areas stay bare metal
      return {
        roughness: 1,
        metalness: 1,
        anisotropy: 0.65,
        anisotropyRotation: 0,
        clearcoat: 0.15,
        clearcoatRoughness: 0.35,
        envMapIntensity: 1.25,
        normalScale: new THREE.Vector2(0.2, 0.2),
      };
    default:
      // matte UV ink: velvety, with a soft sheen at grazing angles
      return {
        roughness: 1,
        metalness: 1,
        sheen: 0.35,
        sheenRoughness: 0.7,
        sheenColor: new THREE.Color("#ffffff"),
        envMapIntensity: 0.55,
        normalScale: new THREE.Vector2(0.28, 0.28),
      };
  }
}

function Plate({ image, dims, finish = "mat", frameColor, brand = "ArtForge" }: PlateViewerProps) {
  const w = dims.w * U;
  const h = dims.h * U;
  const group = useRef<THREE.Group>(null);
  const tex = useCoverTexture(image, dims.w / dims.h);
  const glint = useGlintMaterial(dims.w / dims.h);
  const back = useBackTexture(`${dims.w} × ${dims.h} CM`, brand);
  useIntroMotion(group, glint, {
    restIntensity: finish === "brillant" ? 0.14 : finish === "brosse" ? 0.12 : 0.05,
    replayKey: `${image}-${dims.w}-${finish}`,
    ready: !!tex,
  });

  // geometry: rounded steel blank with a rolled edge, print and back as separate skins
  const geo = useMemo(() => {
    const outline = roundedRectShape(w - BEVEL * 2, h - BEVEL * 2, RADIUS);
    const body = new THREE.ExtrudeGeometry(outline, {
      depth: THICK,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelSegments: 3,
      curveSegments: 10,
    });
    body.translate(0, 0, -THICK / 2);
    const skin = roundedRectShape(w - BEVEL * 2.4, h - BEVEL * 2.4, RADIUS * 0.96);
    return { body, face: planarShapeGeometry(skin, 10), glint: planarShapeGeometry(roundedRectShape(w, h, RADIUS), 10) };
  }, [w, h]);
  useEffect(() => () => [geo.body, geo.face, geo.glint].forEach((g) => g.dispose()), [geo]);

  // ink relief + roughness/metal maps, derived from the artwork itself
  const maps = useMemo(() => {
    if (!tex?.image) return null;
    const img = tex.image as HTMLImageElement;
    const seed = Array.from(image).reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) | 0, 7);
    const m = buildPrintMaps(img, finish, seed);
    for (const t of [m.normal, m.orm]) {
      t.repeat.copy(tex.repeat);
      t.offset.copy(tex.offset);
    }
    return m;
  }, [tex, finish, image]);
  useEffect(
    () => () => {
      maps?.normal.dispose();
      maps?.orm.dispose();
    },
    [maps],
  );

  const peel = useMemo(() => {
    const t = orangePeel().clone();
    // one orange-peel tile every ~5 cm of plate
    t.repeat.set(dims.w / 5, dims.h / 5);
    t.needsUpdate = true;
    return t;
  }, [dims.w, dims.h]);
  useEffect(() => () => peel.dispose(), [peel]);

  const materials = useMemo(() => {
    const edge = new THREE.MeshPhysicalMaterial({ color: "#cfd2d6", metalness: 1, roughness: 0.28, envMapIntensity: 1.1 });
    const print = new THREE.MeshPhysicalMaterial({ color: "#2a2724", ...surfaceProps(finish) });
    const backMat = new THREE.MeshStandardMaterial({ map: back, metalness: 0.85, roughness: 0.45 });
    return { edge, print, back: backMat };
  }, [finish, back]);
  useEffect(() => () => Object.values(materials).forEach((m) => m.dispose()), [materials]);

  // attach textures once they exist (three.js must recompile the shader when a map appears)
  useEffect(() => {
    const p = materials.print;
    p.map = tex;
    p.normalMap = maps?.normal ?? null;
    p.roughnessMap = maps?.orm ?? null;
    p.metalnessMap = maps?.orm ?? null;
    p.clearcoatNormalMap = finish === "brillant" ? peel : null;
    if (!maps) {
      p.roughness = 0.7;
      p.metalness = 0.05;
    } else {
      p.roughness = 1;
      p.metalness = 1;
    }
    p.color.set(tex ? "#ffffff" : "#2a2724");
    p.needsUpdate = true;
  }, [materials, tex, maps, peel, finish]);

  const fw = 0.22; // 2.2 cm moulding
  const fd = 0.24;
  const wood = frameColor && /^#(a|b|c|d|8|9)/i.test(frameColor);

  return (
    <group ref={group}>
      <mesh geometry={geo.body} material={materials.edge} castShadow />
      <mesh geometry={geo.face} material={materials.print} position={[0, 0, THICK / 2 + BEVEL + 0.0002]} />
      <mesh geometry={geo.face} material={materials.back} position={[0, 0, -THICK / 2 - BEVEL - 0.0002]} rotation={[0, Math.PI, 0]} />
      <mesh geometry={geo.glint} position={[0, 0, THICK / 2 + BEVEL + 0.0012]} material={glint} renderOrder={2} />
      {/* magnet on the back */}
      <mesh position={[0, 0, -THICK / 2 - 0.013]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.14, 0.14, 0.022, 40]} />
        <meshStandardMaterial color="#6f7378" metalness={1} roughness={0.25} />
      </mesh>
      {frameColor && (
        <group position={[0, 0, -fd / 2 + THICK / 2 + 0.02]}>
          {[
            { p: [0, h / 2 + fw / 2, 0], s: [w + fw * 2, fw, fd] },
            { p: [0, -h / 2 - fw / 2, 0], s: [w + fw * 2, fw, fd] },
            { p: [w / 2 + fw / 2, 0, 0], s: [fw, h, fd] },
            { p: [-w / 2 - fw / 2, 0, 0], s: [fw, h, fd] },
          ].map((b, i) => (
            <mesh key={i} position={b.p as [number, number, number]} castShadow>
              <boxGeometry args={b.s as [number, number, number]} />
              <meshStandardMaterial color={frameColor} roughness={wood ? 0.7 : 0.5} metalness={0} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

export default function PlateViewer3D(props: PlateViewerProps) {
  const w = props.dims.w * U;
  const h = props.dims.h * U;
  const fov = 30;
  const dist = (Math.max(h, w * 0.8) / 2 / Math.tan(((fov / 2) * Math.PI) / 180)) * 1.55;

  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov, position: [0, 0.05, dist], near: 0.05, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1 }}
      shadows
    >
      <StudioEnvironment intensity={props.finish === "mat" || !props.finish ? 0.6 : 0.7} />
      <directionalLight position={[2.5, 3, 4]} intensity={0.9} castShadow />
      {/* low raking light: makes the ink relief and the edge readable */}
      <directionalLight position={[-3.5, 0.6, 1.2]} intensity={0.28} color="#ffd9b8" />
      <Plate {...props} />
      <ContactShadows
        position={[0, -h / 2 - 0.45, 0]}
        opacity={props.background === "paper" ? 0.35 : 0.6}
        scale={Math.max(w, h) * 2.4}
        blur={2.8}
        far={2.5}
        resolution={512}
        color="#000000"
      />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={dist * 0.3}
        maxDistance={dist * 1.6}
        minPolarAngle={Math.PI * 0.22}
        maxPolarAngle={Math.PI * 0.68}
        minAzimuthAngle={-Math.PI * 0.95}
        maxAzimuthAngle={Math.PI * 0.95}
        rotateSpeed={0.7}
      />
    </Canvas>
  );
}
