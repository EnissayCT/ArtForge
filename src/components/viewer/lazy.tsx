"use client";

import dynamic from "next/dynamic";
import { Mark } from "@/components/brand/Logo";

function Loading() {
  return (
    <div className="grid size-full place-items-center">
      <div className="flex flex-col items-center gap-3 text-paper/50">
        <Mark className="h-8 w-auto animate-pulse" />
        <span className="label">Préparation de la vue 3D</span>
      </div>
    </div>
  );
}

export const PlateViewer = dynamic(() => import("./PlateViewer3D"), { ssr: false, loading: Loading });
export const PhoneViewer = dynamic(() => import("./PhoneViewer3D"), { ssr: false, loading: Loading });
