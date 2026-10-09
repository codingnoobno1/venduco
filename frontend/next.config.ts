import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Production server build — enables SSR, middleware, rewrites, image optimisation.
  // Produces a standalone deployment folder with only required dependencies.
  output: 'standalone',

  images: {
    // Image optimisation is now enabled (no longer static export).
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 768, 1024, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: 'blogger.googleusercontent.com' },
      { protocol: 'https', hostname: 'currentaffairs.adda247.com' },
      { protocol: 'https', hostname: 'static.tnn.in' },
      { protocol: 'https', hostname: 'www.railwaypro.com' },
      { protocol: 'https', hostname: 'www.constructionweekonline.in' },
      { protocol: 'https', hostname: 'indiashippingnews.com' },
      { protocol: 'https', hostname: 'tse4.mm.bing.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },

  // Proxy all /api/v1/* calls to the Kotlin/Spring Boot backend.
  // This makes API calls same-origin from the browser's perspective,
  // so HttpOnly cookies are forwarded automatically and CORS is eliminated.
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.SPRING_API_URL || 'http://localhost:8080'}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;

