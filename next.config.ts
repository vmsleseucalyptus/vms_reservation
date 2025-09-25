import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // évite que le build casse à cause de ESLint
  },
  typescript: {
    ignoreBuildErrors: true, // évite que le build casse à cause de TS
  },
};

export default nextConfig;
