import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: '/shop', destination: '/', permanent: true }];
  },
};

export default nextConfig;
