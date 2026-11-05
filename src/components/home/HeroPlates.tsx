"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { Artwork } from "@/lib/catalog";
import { isLandscape } from "@/lib/catalog";
import { cn } from "@/lib/utils";

/**
 * Three plates floating in perspective. They follow the pointer a little and
 * catch the light one after the other.
 */
export function HeroPlates({ arts }: { arts: Artwork[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glinting, setGlinting] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setGlinting((g) => (g + 1) % 3), 2600);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const on = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        setTilt({
          x: ((e.clientX - r.left) / r.width - 0.5) * 2,
          y: ((e.clientY - r.top) / r.height - 0.5) * 2,
        });
      });
    };
    window.addEventListener("pointermove", on, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", on);
    };
  }, []);

  const layout = [
    { left: "4%", top: "18%", w: "31%", z: -120, ry: 22, rx: 2, depth: 0.6 },
    { left: "33%", top: "4%", w: "40%", z: 0, ry: -6, rx: 1, depth: 1 },
    { left: "71%", top: "26%", w: "27%", z: -80, ry: -24, rx: 2, depth: 0.75 },
  ];

  return (
    <div ref={ref} className="relative h-full w-full" style={{ perspective: "1600px" }}>
      {arts.slice(0, 3).map((a, i) => {
        const l = layout[i];
        const land = isLandscape(a);
        return (
          <Link
            key={a.slug}
            href={`/oeuvre/${a.slug}`}
            className="group absolute block animate-fade-up"
            style={{
              left: l.left,
              top: l.top,
              width: l.w,
              animationDelay: `${200 + i * 140}ms`,
              transformStyle: "preserve-3d",
              transform: `translateZ(${l.z}px) rotateY(${l.ry + tilt.x * 5 * l.depth}deg) rotateX(${l.rx - tilt.y * 4 * l.depth}deg)`,
              transition: "transform 0.9s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            <div
              className={cn(
                "glint glint-strong relative overflow-hidden rounded-[2px]",
                glinting === i && "is-glinting",
                land ? "aspect-[4/3]" : "aspect-[3/4]",
              )}
              style={{
                backgroundColor: a.color,
                boxShadow:
                  "inset 0 0 0 .5px rgba(255,255,255,.25), 0 2px 3px rgba(0,0,0,.4), 0 30px 60px -20px rgba(0,0,0,.8), 0 60px 90px -40px rgba(0,0,0,.6)",
              }}
            >
              <Image src={a.image} alt={a.title} fill priority sizes="(min-width:1024px) 22vw, 40vw" className="object-cover" />
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-2 opacity-70 transition-opacity group-hover:opacity-100">
              <span className="truncate text-[12px] text-paper">{a.title}</span>
              <span className="label shrink-0 text-[9.5px] text-paper/60">{land ? "40 × 30" : "30 × 40"} cm</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
