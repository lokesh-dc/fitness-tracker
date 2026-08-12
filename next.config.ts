import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  customWorkerSrc: "worker", // Point to the worker directory containing index.ts
  disable: false, // Ensure it's enabled for build
  register: true,
});

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Ensure we are not using turbopack for build if that's the issue
  // But Next 16+ defaults to it. Let's see if we can force webpack.
  webpack: (config) => {
    return config;
  },
};

export default withPWA(nextConfig);
