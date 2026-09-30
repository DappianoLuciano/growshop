import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV !== 'production';

// Política de contenido: solo recursos propios + imágenes de Cloudinary/Unsplash.
// 'unsafe-inline' en scripts es necesario para los scripts de arranque de Next.js
// (sin nonces); 'unsafe-eval' solo en desarrollo (recarga en caliente).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com",
  "font-src 'self' data:",
  `connect-src 'self'${isDev ? ' ws: wss:' : ''}`,
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

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

  // Encabezados de seguridad para todas las rutas
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: contentSecurityPolicy },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        ],
      },
    ];
  },

  // Dominios permitidos para next/image
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
