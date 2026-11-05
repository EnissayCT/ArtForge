import scenesData from "@/data/scenes.json";
import videosData from "@/data/videos.json";

export interface Scene {
  id: string;
  name: string;
  image: string;
  w: number;
  h: number;
  anchor: { x: number; y: number };
  /** real centimetres spanned by the full image width at the wall plane */
  cmPerWidth: number;
  maxHeightCm: number;
  /** degrees of rotateY when the wall is not facing the camera */
  tilt?: number;
  source?: string;
  license?: string;
}

export interface Video {
  id: string;
  src: string;
  poster: string;
  w: number;
  h: number;
  duration: number;
  theme: string;
  description: string;
}

export const SCENES = scenesData as Scene[];
export const VIDEOS = videosData as Video[];

export function video(theme: string) {
  return VIDEOS.find((v) => v.theme === theme || v.id === theme) ?? VIDEOS[0];
}
