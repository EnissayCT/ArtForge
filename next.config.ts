import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // the parent folder has its own lockfile; pin the workspace root to this project
  turbopack: { root: path.resolve(__dirname) },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
  },
};

export default nextConfig;
