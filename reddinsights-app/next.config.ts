import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  webpack: (config: any) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      bufferutil: false,
      'utf-8-validate': false,
    }
    return config
  }
};

export default nextConfig;
