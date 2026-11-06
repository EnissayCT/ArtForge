"use client";

import { useMemo, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import type { PhoneModel } from "@/lib/phones";
import type { CaseStyle } from "@/lib/pricing";
import {
  StudioEnvironment,
  planarShapeGeometry,
  roundedRectShape,
  useCoverTexture,
  useGlintMaterial,
  useIntroMotion,
} from "./common";

export interface PhoneViewerProps {
  image: string;
  phone: PhoneModel;
  caseType?: CaseStyle;
}

const U = 0.1; // 1 unit = 1 cm, measurements are in mm

function PhoneCase({ image, phone, caseType = "slim" }: PhoneViewerProps) {
  const lip = caseType === "antichoc" ? 1.6 : 1.1; // mm of case around the phone
  const W = (phone.w + lip * 2) * U;
  const H = (phone.h + lip * 2) * U;
  const D = (phone.d + (caseType === "antichoc" ? 3.2 : 2.2)) * U;
  const R = (phone.radius + lip) * U;
  const bevel = 0.06;

  const group = useRef<THREE.Group>(null);
  const tex = useCoverTexture(image, W / H);
  const glint = useGlintMaterial(W / H);
  useIntroMotion(group, glint, { restIntensity: 0.14, replayKey: `${image}-${phone.id}`, ready: !!tex });

  const { body, back, screen, cam, lenses } = useMemo(() => {
    const shape = roundedRectShape(W - bevel * 2, H - bevel * 2, Math.max(0.05, R - bevel));
    const body = new THREE.ExtrudeGeometry(shape, {
      depth: D - bevel * 2,
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 5,
      curveSegments: 28,
    });
    body.center();
    const backShape = roundedRectShape(W - 0.05, H - 0.05, R - 0.03);
    const back = planarShapeGeometry(backShape, 28);
    const screen = planarShapeGeometry(roundedRectShape(phone.w * U - 0.1, phone.h * U - 0.1, phone.radius * U - 0.05), 28);

    const m = phone.module;
    const cam = m
      ? (() => {
          const g = new THREE.ExtrudeGeometry(roundedRectShape(m.w * U, m.h * U, m.r * U), {
            depth: 0.07,
            bevelEnabled: true,
            bevelThickness: 0.03,
            bevelSize: 0.03,
            bevelSegments: 4,
            curveSegments: 20,
          });
          return {
            geo: g,
            x: -W / 2 + (lip + m.x + m.w / 2) * U,
            y: H / 2 - (lip + m.y + m.h / 2) * U,
          };
        })()
      : null;
    const lenses = phone.lenses.map((l) => ({
      x: -W / 2 + (lip + l.x) * U,
      y: H / 2 - (lip + l.y) * U,
      r: l.r * U,
    }));
    return { body, back, screen, cam, lenses };
  }, [W, H, D, R, phone, lip]);

  const frontZ = D / 2;
  const moduleZ = frontZ + 0.002;
  const lensBase = cam ? moduleZ + 0.1 : frontZ + 0.002;

  return (
    <group ref={group}>
      <mesh geometry={body} castShadow>
        <meshPhysicalMaterial
          color={caseType === "antichoc" ? "#1c1c1e" : "#232325"}
          roughness={0.55}
          metalness={0.1}
          clearcoat={0.3}
          clearcoatRoughness={0.5}
        />
      </mesh>
      <mesh geometry={back} position={[0, 0, frontZ + 0.001]}>
        <meshPhysicalMaterial
          key={tex?.uuid ?? "loading"}
          map={tex}
          color={tex ? "#ffffff" : "#2a2724"}
          roughness={0.42}
          metalness={0}
          clearcoat={0.7}
          clearcoatRoughness={0.08}
          envMapIntensity={0.55}
        />
      </mesh>
      <mesh geometry={back} position={[0, 0, frontZ + 0.0018]} material={glint} renderOrder={2} />
      {/* screen side */}
      <mesh geometry={screen} position={[0, 0, -D / 2 - 0.001]} rotation={[0, Math.PI, 0]}>
        <meshPhysicalMaterial color="#050506" roughness={0.08} metalness={0.2} clearcoat={1} />
      </mesh>
      {cam && (
        <mesh geometry={cam.geo} position={[cam.x, cam.y, moduleZ]}>
          <meshPhysicalMaterial color="#141416" roughness={0.25} metalness={0.4} clearcoat={0.8} transparent opacity={0.92} />
        </mesh>
      )}
      {lenses.map((l, i) => (
        <group key={i} position={[l.x, l.y, lensBase]} rotation={[Math.PI / 2, 0, 0]}>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[l.r, l.r, 0.08, 40]} />
            <meshStandardMaterial color="#9a9ca0" metalness={1} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.072, 0]}>
            <cylinderGeometry args={[l.r * 0.8, l.r * 0.8, 0.01, 40]} />
            <meshPhysicalMaterial color="#05060a" roughness={0.02} metalness={0.5} clearcoat={1} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

export default function PhoneViewer3D(props: PhoneViewerProps) {
  const H = props.phone.h * U;
  const fov = 30;
  const dist = (H / 2 / Math.tan(((fov / 2) * Math.PI) / 180)) * 1.65;
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ fov, position: [0, 0.1, dist], near: 0.05, far: 100 }}
      gl={{ antialias: true, toneMapping: THREE.NeutralToneMapping, toneMappingExposure: 1 }}
      shadows
    >
      <StudioEnvironment intensity={0.6} />
      
      <directionalLight position={[2, 3, 4]} intensity={0.8} castShadow />
      <directionalLight position={[-3, 1, 2]} intensity={0.2} color="#ffd9b8" />
      <PhoneCase {...props} />
      <ContactShadows position={[0, -H / 2 - 0.35, 0]} opacity={0.55} scale={H * 2.4} blur={2.6} far={2} resolution={512} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minDistance={dist * 0.5}
        maxDistance={dist * 1.6}
        minPolarAngle={Math.PI * 0.2}
        maxPolarAngle={Math.PI * 0.7}
        rotateSpeed={0.7}
      />
    </Canvas>
  );
}
