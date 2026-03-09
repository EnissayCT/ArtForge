import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.displate.com",
        pathname: "/artwork/**",
      },
    ],
  },
};

export default nextConfig;
