import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración de Turbopack (Next.js 16)
  turbopack: {},

  // Configuración de webpack para compatibilidad
  webpack: (config) => {
    config.externals = [...(config.externals || []), 'pg-native'];
    return config;
  },

  // Configurar dominios de imágenes
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
