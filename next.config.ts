import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Next/Image MUST be unoptimized for static export
   */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "blogger.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "currentaffairs.adda247.com",
      },
      {
        protocol: "https",
        hostname: "static.tnn.in",
      },
      {
        protocol: "https",
        hostname: "www.railwaypro.com",
      },
      {
        protocol: "https",
        hostname: "www.constructionweekonline.in",
      },
      {
        protocol: "https",
        hostname: "indiashippingnews.com",
      },
      {
        protocol: "https",
        hostname: "tse4.mm.bing.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },

  /**
   * Turbopack config (Next.js 16+)
   * React Native Web support
   */
  turbopack: {
    resolveAlias: {
      "react-native": "react-native-web",
    },
    resolveExtensions: [
      ".web.js",
      ".web.ts",
      ".web.tsx",
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
    ],
  },

  /**
   * Webpack fallback (non-turbopack builds)
   */
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      "react-native$": "react-native-web",
    };

    config.resolve.extensions = [
      ".web.js",
      ".web.ts",
      ".web.tsx",
      ...(config.resolve.extensions || []),
    ];

    return config;
  },
};

export default nextConfig;
