"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Trash2,
  AlignCenter,
  FlipHorizontal2,
  FlipVertical2,
  RotateCw,
} from "lucide-react";

interface DesignControlsProps {
  onRemove: () => void;
  onCenter: () => void;
  onFlipH: () => void;
  onFlipV: () => void;
  onRotate: (deg: number) => void;
  onScale: (scale: number) => void;
  onOpacity: (opacity: number) => void;
  getActiveInfo: () => {
    angle: number;
    scaleX: number;
    scaleY: number;
    opacity: number;
    flipX: boolean;
    flipY: boolean;
  } | null;
}

export function DesignControls({
  onRemove,
  onCenter,
  onFlipH,
  onFlipV,
  onRotate,
  onScale,
  onOpacity,
  getActiveInfo,
}: DesignControlsProps) {
  const [info, setInfo] = useState(() => getActiveInfo());

  useEffect(() => {
    const interval = setInterval(() => {
      setInfo(getActiveInfo());
    }, 200);
    return () => clearInterval(interval);
  }, [getActiveInfo]);

  if (!info) return null;

  const actions = [
    { icon: AlignCenter, label: "Centrer", onClick: onCenter },
    { icon: FlipHorizontal2, label: "Miroir H", onClick: onFlipH },
    { icon: FlipVertical2, label: "Miroir V", onClick: onFlipV },
    { icon: RotateCw, label: "+90°", onClick: () => onRotate((info.angle + 90) % 360) },
  ];

  return (
    <div className="p-3 space-y-3">
      {/* Quick Actions */}
      <div className="flex items-center gap-1">
        {actions.map((a) => (
          <Button
            key={a.label}
            variant="ghost"
            size="sm"
            onClick={a.onClick}
            title={a.label}
            className="h-8 gap-1 text-xs flex-1"
          >
            <a.icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{a.label}</span>
          </Button>
        ))}
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          title="Supprimer"
          className="h-8 gap-1 text-xs"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Sliders — compact grid */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-16 shrink-0">Rotation</span>
          <input
            type="range"
            min={0}
            max={360}
            step={1}
            value={info.angle}
            onChange={(e) => onRotate(Number(e.target.value))}
            className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-orange-500"
          />
          <span className="text-[11px] text-accent font-mono w-10 text-right">{Math.round(info.angle)}°</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-16 shrink-0">Taille</span>
          <input
            type="range"
            min={10}
            max={300}
            step={1}
            value={Math.round(info.scaleX * 100)}
            onChange={(e) => onScale(Number(e.target.value) / 100)}
            className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-orange-500"
          />
          <span className="text-[11px] text-accent font-mono w-10 text-right">{Math.round(info.scaleX * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-muted-foreground w-16 shrink-0">Opacité</span>
          <input
            type="range"
            min={10}
            max={100}
            step={1}
            value={Math.round(info.opacity * 100)}
            onChange={(e) => onOpacity(Number(e.target.value) / 100)}
            className="flex-1 h-1.5 bg-secondary rounded-full appearance-none cursor-pointer accent-orange-500"
          />
          <span className="text-[11px] text-accent font-mono w-10 text-right">{Math.round(info.opacity * 100)}%</span>
        </div>
      </div>
    </div>
  );
}
