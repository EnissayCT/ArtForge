"use client";

import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { PLATE_SIZES, PHONE_MODELS, type PhoneModelId } from "@/config/products";

interface ProductModelProps {
  category: "METAL_PLATE" | "PHONE_CASE";
  textureUrl: string | null;
  finish: "MATTE" | "GLOSS";
  size: "A3" | "A4";
  phoneModel: string | null;
}

export function ProductModel({
  category,
  textureUrl,
  finish,
  size,
  phoneModel,
}: ProductModelProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const { gl } = useThree();

  // Load texture with high quality settings
  const texture = useMemo(() => {
    if (!textureUrl) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(textureUrl);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.generateMipmaps = true;
    tex.minFilter = THREE.LinearMipmapLinearFilter;
    tex.magFilter = THREE.LinearFilter;
    // Max anisotropic filtering for sharp texture at angles
    tex.anisotropy = gl.capabilities.getMaxAnisotropy();
    tex.needsUpdate = true;
    return tex;
  }, [textureUrl, gl]);

  // Update material when texture or finish changes
  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.map = texture;
      materialRef.current.needsUpdate = true;
    }
  }, [texture, finish, category]);

  // Gentle float animation
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
    }
  });

  if (category === "METAL_PLATE") {
    return <MetalPlateModel ref={meshRef} materialRef={materialRef} size={size} texture={texture} finish={finish} />;
  }

  return <PhoneCaseModel ref={meshRef} materialRef={materialRef} phoneModel={phoneModel} texture={texture} finish={finish} />;
}

// Metal Plate - body with separate front-face print
const MetalPlateModel = React.forwardRef<
  THREE.Mesh,
  {
    materialRef: React.RefObject<THREE.MeshPhysicalMaterial | null>;
    size: "A3" | "A4";
    texture: THREE.Texture | null;
    finish: "MATTE" | "GLOSS";
  }
>(({ materialRef, size, texture, finish }, ref) => {
  const config = PLATE_SIZES[size];
  const scale = 2 / Math.max(config.dimensions.width, config.dimensions.height);
  const w = config.dimensions.width * scale;
  const h = config.dimensions.height * scale;
  const d = 0.04;

  return (
    <group>
      {/* Main plate body — plain metal, no texture */}
      <RoundedBox
        ref={ref}
        args={[w, h, d]}
        radius={0.02}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          roughness={finish === "MATTE" ? 0.5 : 0.1}
          metalness={0.4}
          color={texture ? "#e8e8e8" : "#d4d4d8"}
          envMapIntensity={1.0}
          clearcoat={finish === "GLOSS" ? 0.8 : 0.2}
          clearcoatRoughness={finish === "GLOSS" ? 0.1 : 0.5}
        />
      </RoundedBox>

      {/* Front printed face — plane sitting on top of the box */}
      <mesh position={[0, 0, d / 2 + 0.001]}>
        <planeGeometry args={[w - 0.02, h - 0.02]} />
        <meshPhysicalMaterial
          ref={materialRef}
          map={texture}
          roughness={finish === "MATTE" ? 0.55 : 0.08}
          metalness={0.3}
          color={texture ? "#ffffff" : "#d4d4d8"}
          envMapIntensity={1.2}
          clearcoat={finish === "GLOSS" ? 1.0 : 0.3}
          clearcoatRoughness={finish === "GLOSS" ? 0.05 : 0.4}
          reflectivity={0.6}
          transparent={!texture}
          opacity={texture ? 1 : 0}
        />
      </mesh>

      {/* Back face — darker metal */}
      <RoundedBox
        args={[w, h, d * 0.5]}
        position={[0, 0, -d * 0.6]}
        radius={0.02}
        smoothness={4}
      >
        <meshStandardMaterial color="#71717a" roughness={0.6} metalness={0.5} />
      </RoundedBox>
    </group>
  );
});
MetalPlateModel.displayName = "MetalPlateModel";

// Phone Case
const PhoneCaseModel = React.forwardRef<
  THREE.Mesh,
  {
    materialRef: React.RefObject<THREE.MeshPhysicalMaterial | null>;
    phoneModel: string | null;
    texture: THREE.Texture | null;
    finish: "MATTE" | "GLOSS";
  }
>(({ materialRef, phoneModel, texture, finish }, ref) => {
  const modelId = (phoneModel || "iphone-15") as PhoneModelId;
  const config = PHONE_MODELS[modelId];
  const scale = 2 / Math.max(config.dimensions.width, config.dimensions.height);
  const w = config.dimensions.width * scale;
  const h = config.dimensions.height * scale;
  const d = config.dimensions.depth * scale;

  return (
    <group>
      <RoundedBox
        ref={ref}
        args={[w, h, d]}
        radius={0.08}
        smoothness={4}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          ref={materialRef}
          map={texture}
          roughness={finish === "MATTE" ? 0.6 : 0.1}
          metalness={0.05}
          color={texture ? "#ffffff" : "#e4e4e7"}
          envMapIntensity={0.8}
          clearcoat={finish === "GLOSS" ? 0.8 : 0.2}
          clearcoatRoughness={finish === "GLOSS" ? 0.1 : 0.5}
        />
      </RoundedBox>

      {/* Camera cutout */}
      <mesh position={[0, h * 0.32, d * 0.51]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 32]} />
        <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.8} />
      </mesh>
      <mesh position={[0.1, h * 0.32, d * 0.51]}>
        <cylinderGeometry args={[0.06, 0.06, 0.02, 32]} />
        <meshStandardMaterial color="#18181b" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Inner shell */}
      <RoundedBox
        args={[w * 0.92, h * 0.97, d * 0.3]}
        position={[0, 0, -d * 0.4]}
        radius={0.06}
        smoothness={4}
      >
        <meshStandardMaterial color="#27272a" roughness={0.9} metalness={0.1} />
      </RoundedBox>
    </group>
  );
});
PhoneCaseModel.displayName = "PhoneCaseModel";
