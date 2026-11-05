"use client";
/* eslint-disable react-hooks/immutability -- three.js scene objects are mutated in effects and the frame loop, never during React render */

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/** Soft studio reflections generated locally — no HDR download. */
export function StudioEnvironment({ intensity = 1 }: { intensity?: number }) {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = intensity;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, intensity]);
  return null;
}

/** Loads an image as a texture, cropped like CSS object-fit: cover to `aspect`. */
export function useCoverTexture(src: string, aspect: number) {
  const gl = useThree((s) => s.gl);
  const [tex, setTex] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    let alive = true;
    let loaded: THREE.Texture | null = null;
    new THREE.TextureLoader().load(src, (t) => {
      if (!alive) return t.dispose();
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = gl.capabilities.getMaxAnisotropy();
      t.generateMipmaps = true;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      loaded = t;
      setTex(t);
    });
    return () => {
      alive = false;
      loaded?.dispose();
    };
  }, [src, gl]);

  useEffect(() => {
    if (!tex?.image) return;
    const img = tex.image as { width: number; height: number };
    const ia = img.width / img.height;
    tex.repeat.set(1, 1);
    tex.offset.set(0, 0);
    if (ia > aspect) {
      tex.repeat.x = aspect / ia;
      tex.offset.x = (1 - tex.repeat.x) / 2;
    } else {
      tex.repeat.y = ia / aspect;
      tex.offset.y = (1 - tex.repeat.y) / 2;
    }
    tex.needsUpdate = true;
  }, [tex, aspect]);

  return tex;
}

const glintVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const glintFragment = /* glsl */ `
  uniform float uProgress;
  uniform float uIntensity;
  uniform float uAspect;
  varying vec2 vUv;
  void main() {
    float d = (vUv.x * uAspect * 0.9 + vUv.y * 0.55) / (uAspect * 0.9 + 0.55) - uProgress;
    float wide = exp(-pow(d / 0.045, 2.0)) * 0.7;
    float core = exp(-pow(d / 0.012, 2.0)) * 0.5;
    float thin = exp(-pow((d + 0.085) / 0.01, 2.0)) * 0.45;
    float a = (wide + core + thin) * uIntensity;
    gl_FragColor = vec4(vec3(1.0, 0.985, 0.96) * a, a);
  }
`;

export function useGlintMaterial(aspect: number) {
  return useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: glintVertex,
        fragmentShader: glintFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
        uniforms: {
          uProgress: { value: -0.5 },
          uIntensity: { value: 0 },
          uAspect: { value: aspect },
        },
      }),
    [aspect],
  );
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * The "shine on open": the object swings in while a bright band of light
 * crosses it, then the sheen keeps following the viewing angle.
 */
export function useIntroMotion(
  group: React.RefObject<THREE.Group | null>,
  glint: THREE.ShaderMaterial,
  opts: { restIntensity: number; replayKey: unknown; ready: boolean },
) {
  const start = useRef<number | null>(null);
  const controlsTouched = useRef(false);

  useEffect(() => {
    start.current = null;
  }, [opts.replayKey]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const now = state.clock.elapsedTime;
    if (!opts.ready) {
      // hold the starting pose until the artwork has loaded, so the shine is seen
      g.rotation.set(0.12, -0.85, 0);
      g.position.z = -1.2;
      glint.uniforms.uIntensity.value = 0;
      start.current = null;
      return;
    }
    if (start.current === null) start.current = now;
    const t = now - start.current;

    const swing = Math.min(1, t / 1.5);
    const e = easeOut(swing);
    g.rotation.y = -0.85 * (1 - e) + Math.sin(now * 0.6) * 0.035 * e;
    g.rotation.x = 0.12 * (1 - e) + Math.sin(now * 0.45) * 0.015 * e;
    g.position.z = -1.2 * (1 - e);

    const sweep = Math.min(1, Math.max(0, (t - 0.35) / 1.25));
    if (sweep < 1) {
      glint.uniforms.uProgress.value = -0.35 + easeInOut(sweep) * 1.75;
      glint.uniforms.uIntensity.value = Math.sin(sweep * Math.PI) * 0.85 + opts.restIntensity * sweep;
    } else {
      // live sheen: follows the camera around the object
      const az = Math.atan2(state.camera.position.x, state.camera.position.z);
      const el = state.camera.position.y / Math.max(0.001, state.camera.position.length());
      const target = 0.5 - az * 0.9 - el * 0.6 + Math.sin(now * 0.35) * 0.04;
      glint.uniforms.uProgress.value += (target - glint.uniforms.uProgress.value) * 0.08;
      glint.uniforms.uIntensity.value += (opts.restIntensity - glint.uniforms.uIntensity.value) * 0.05;
    }
  });

  return controlsTouched;
}

export function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return s;
}

/** ShapeGeometry with 0–1 UVs over its bounding box (three's default UVs are in shape units). */
export function planarShapeGeometry(shape: THREE.Shape, segments = 24) {
  const geo = new THREE.ShapeGeometry(shape, segments);
  geo.computeBoundingBox();
  const bb = geo.boundingBox!;
  const pos = geo.attributes.position;
  const uv = new Float32Array(pos.count * 2);
  for (let i = 0; i < pos.count; i++) {
    uv[i * 2] = (pos.getX(i) - bb.min.x) / (bb.max.x - bb.min.x);
    uv[i * 2 + 1] = (pos.getY(i) - bb.min.y) / (bb.max.y - bb.min.y);
  }
  geo.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  return geo;
}

/** Brushed-steel back with the ArtForge stamp. */
export function useBackTexture(label: string) {
  return useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 512;
    c.height = 512;
    const g = c.getContext("2d")!;
    g.fillStyle = "#9da1a6";
    g.fillRect(0, 0, 512, 512);
    for (let y = 0; y < 512; y++) {
      const v = 150 + (((y * 9301 + 49297) % 233280) / 233280) * 40;
      g.fillStyle = `rgba(${v},${v + 3},${v + 6},0.35)`;
      g.fillRect(0, y, 512, 1);
    }
    g.fillStyle = "rgba(30,30,32,0.55)";
    g.textAlign = "center";
    g.font = "800 44px Archivo, Arial Narrow, sans-serif";
    g.fillText("ARTFORGE", 256, 150);
    g.font = "500 18px monospace";
    g.fillText(label, 256, 186);
    g.fillText("IMPRIMÉ AU MAROC", 256, 400);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [label]);
}
