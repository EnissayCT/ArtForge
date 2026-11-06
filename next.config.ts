import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // self-contained server build for the VPS (node server.js)
  output: "standalone",
  poweredByHeader: false,
  // the parent folder has its own lockfile; pin the workspace root to this project
  turbopack: { root: path.resolve(__dirname) },
  outputFileTracingRoot: path.resolve(__dirname),
  // lib/store.ts reads ./data at runtime, which makes the tracer copy the whole project; ship only the server
  outputFileTracingExcludes: {
    "*": [
      "ads/**",
      "data/**",
      "scripts/**",
      ".secrets/**",
      "src/**",
      "public/**",
      ".env*",
      "*.md",
      "tsconfig*",
      "eslint.config.*",
      "postcss.config.*",
      "next.config.*",
      "package-lock.json",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
  },
  experimental: {
    // artwork images are uploaded from the admin through server actions (resized in the browser first)
    serverActions: { bodySizeLimit: "12mb" },
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
      {
        source: "/admin",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "no-referrer" },
        ],
      },
    ];
  },
};

export default nextConfig;
