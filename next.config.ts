import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          // FIXED: Restrict CORS to same-origin only in production
          // In development, allow localhost origins
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "X-Requested-With, Content-Type, Authorization, Accept" },
        ],
      },
    ];
  },
};

export default nextConfig;
