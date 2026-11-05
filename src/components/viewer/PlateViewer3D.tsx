"use client";
/* eslint-disable react-hooks/immutability -- three.js scene objects are mutated in effects and the frame loop, never during React render */

import { useEffect, useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { FinishId, FrameId } from "@/lib/pricing";
import { StudioEnvironment, useBackTexture, useCoverTexture, useGlintMaterial, useIntroMotion } from "./common";

export interface PlateViewerProps {
  image: string;
  /** cm, already oriented */
  dims: { w: number; h: number };
  finish?: FinishId;
  frame?: FrameId;
  background?: "ink" | "paper";
}

const U = 0.1; // 1 scene unit = 10 cm
const THICK = 0.012;

function finishProps(finish: FinishId): THREE.MeshPhysicalMaterialParameters {
  switch (finish) {
    case "brillant":
      return { roughness: 0.32, metalness: 0.1, clearcoat: 0.8, clearcoatRoughness: 0.06, envMapIntensity: 0.75 };
    case "brosse":
      return { roughness: 0.38, metalness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.3, envMapIntensity: 1.3 };
    default:
      return { roughness: 0.72, metalness: 0.05, clearcoat: 0, envMapIntensity: 0.55 };
  }
}

function Plate({ image, dims, finish = "mat", frame = "aucun" }: PlateViewerProps) {
  const w = dims.w * U;
  const h = dims.h * U;
  const group = useRef<THREE.Group>(null);
  const tex = useCoverTexture(image, dims.w / dims.h);
  const glint = useGlintMaterial(dims.w / dims.h);
  const back = useBackTexture(`${dims.w} × ${dims.h} CM`);
  useIntroMotion(group, glint, {
    restIntensity: finish === "brillant" ? 0.14 : finish === "brosse" ? 0.12 : 0.05,
    replayKey: `${image}-${dims.w}-${finish}`,
    ready: !!tex,
  });

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ color: "#c7cacf", metalness: 1, roughness: 0.32 });
    const front = new THREE.MeshPhysicalMaterial({ color: "#ffffff", ...finishProps(finish) });
    const backMat = new THREE.MeshStandardMaterial({ map: back, metalness: 0.85, roughness: 0.45 });
    return [edge, edge, edge, edge, front, backMat];
  }, [finish, back]);

  // keep the texture in sync without recreating materials
  useEffect(() => {
    const front = materials[4] as THREE.MeshPhysicalMaterial;
    front.map = tex;
    front.color.set(tex ? "#ffffff" : "#2a2724");
    front.needsUpdate = true;
  }, [materials, tex]);

  const frameColor = frame === "chene" ? "#a67c4e" : frame === "noir" ? "#1d1c1b" : null;
  const fw = 0.22; // 2.2 cm moulding
  const fd = 0.24;

  return (
    <group ref={group}>
      <mesh material={materials} castShadow>
        <boxGeometry args={[w, h, THICK]} />
      </mesh>
      <mesh position={[0, 0, THICK / 2 + 0.0008]} material={glint} renderOrder={2}>
        <planeGeometry args={[w, h]} />
      </mesh>
      {/* magnet on the back */}
      <mesh position={[0, 0, -THICK / 2 - 0.012]} rotation={[Math.PI / 2, 0, 0]}>
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
              <meshStandardMaterial
                color={frameColor}
                roughness={frame === "chene" ? 0.7 : 0.5}
                metalness={0}
              />
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
      <StudioEnvironment intensity={props.finish === "mat" ? 0.6 : 0.7} />
      
      <directionalLight position={[2.5, 3, 4]} intensity={0.9} castShadow />
      <directionalLight position={[-3, 1, 2]} intensity={0.2} color="#ffd9b8" />
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
        minDistance={dist * 0.45}
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
