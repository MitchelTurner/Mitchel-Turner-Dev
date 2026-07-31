import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/web-design", destination: "/web-design.html" },
      { source: "/custom-software", destination: "/custom-software.html" },
      { source: "/hardware", destination: "/hardware.html" },
    ];
  },
};

export default nextConfig;
