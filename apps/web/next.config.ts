import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "www.anyu.tw",
          },
        ],
        destination: "https://anyu.tw/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
