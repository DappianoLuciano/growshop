import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Output standalone para Electron
  output: process.env.BUILD_STANDALONE ? 'standalone' : undefined,

  // Configuración de Turbopack (Next.js 16)
  turbopack: {},

  // Configuración de webpack para compatibilidad
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'pg-native'];
    return config;
  },

  // Configurar dominios de imágenes
  // Encabezados de seguridad para todas las rutas
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
