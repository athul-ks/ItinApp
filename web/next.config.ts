import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // This tells Next.js: "Don't try to bundle these, just run them in Node"
    serverComponentsExternalPackages: ["@itinapp/db"], 
  },
};

export default nextConfig;
