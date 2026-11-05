"use client";

import { useEffect, useRef } from "react";
import type { Video } from "@/lib/media";
import { cn } from "@/lib/utils";

/** Muted looping background video that only plays while visible. */
export function VideoLoop({ video, className }: { video: Video; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) el.play().catch(() => {});
      else el.pause();
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <video
      ref={ref}
      className={cn("size-full object-cover", className)}
      src={video.src}
      poster={video.poster}
      muted
      loop
      playsInline
      preload="metadata"
      aria-hidden="true"
    />
  );
}
