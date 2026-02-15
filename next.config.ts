import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/uplan-engine",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
