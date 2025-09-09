import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  outputFileTracingIncludes: {
    '/': ['./schema.sql', './scripts/**/*', './src/lib/**/*'],
  },
};

export default nextConfig;
