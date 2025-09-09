import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    outputFileTracingIncludes: {
      '/': ['./schema.sql', './scripts/**/*', './src/lib/**/*'],
    },
  },
};

export default nextConfig;
