"use client";

import { Suspense, useRef, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
} from "@react-three/drei";
import { useEditorStore } from "@/stores/editor-store";
import { ProductModel } from "./ProductModel";
import * as THREE from "three";

/* Controls that allow full rotation but smoothly return to front face when idle */
function SceneControls() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);
  const interacting = useRef(false);
  const idleTime = useRef(0);
  const initialPos = new THREE.Vector3(0, 0, 3.8);

  const handleStart = useCallback(() => {
    interacting.current = true;
    idleTime.current = 0;
  }, []);

  const handleEnd = useCallback(() => {
    interacting.current = false;
    idleTime.current = 0;
  }, []);

  useFrame(({ camera }, delta) => {
    if (interacting.current) return;

    idleTime.current += delta;
    if (idleTime.current < 2) return; // wait 2s before returning

    // Smoothly lerp camera back to initial front-facing position
    camera.position.lerp(initialPos, delta * 1.5);
    camera.lookAt(0, 0, 0);
    if (controlsRef.current) controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false}
      enableZoom={true}
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={Math.PI / 4}
      maxPolarAngle={Math.PI - Math.PI / 4}
      minDistance={2.5}
      maxDistance={6}
      onStart={handleStart}
      onEnd={handleEnd}
    />
  );
}

export function Preview3D() {
  const textureDataUrl = useEditorStore((s) => s.textureDataUrl);
  const category = useEditorStore((s) => s.category);
  const finish = useEditorStore((s) => s.finish);
  const size = useEditorStore((s) => s.size);
  const phoneModel = useEditorStore((s) => s.phoneModel);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="relative flex-1 min-h-0 rounded-xl bg-gradient-to-br from-zinc-100 to-zinc-50 dark:from-zinc-900 dark:to-zinc-950 overflow-hidden">
        <Canvas
          camera={{ position: [0, 0, 3.8], fov: 35 }}
          shadows
          dpr={[1, 2]}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            powerPreference: "high-performance",
            alpha: true,
          }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={0.6} />
            <spotLight
              position={[10, 10, 10]}
              angle={0.15}
              penumbra={1}
              intensity={1.2}
              castShadow
              shadow-mapSize={[1024, 1024]}
            />
            <spotLight
              position={[-10, -10, -10]}
              angle={0.15}
              penumbra={1}
              intensity={0.4}
            />
            <directionalLight
              position={[0, 5, 5]}
              intensity={0.3}
            />

            <ProductModel
              category={category || "METAL_PLATE"}
              textureUrl={textureDataUrl}
              finish={finish}
              size={size}
              phoneModel={phoneModel}
            />

            <ContactShadows
              position={[0, -1.8, 0]}
              opacity={0.5}
              scale={10}
              blur={2}
            />
            <Environment preset="studio" />
          </Suspense>

          <SceneControls />
        </Canvas>

        {!textureDataUrl && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center bg-background/80 rounded-lg px-6 py-4 backdrop-blur-sm">
              <div className="text-3xl mb-2">🖼️</div>
              <p className="text-sm text-muted-foreground">
                Uploadez une image pour voir l&apos;aperçu 3D
              </p>
            </div>
          </div>
        )}
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2 shrink-0">
        Glissez pour faire tourner • Scrollez pour zoomer
      </p>
    </div>
  );
}
