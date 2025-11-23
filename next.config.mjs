/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de producción
  compress: true,
  poweredByHeader: false,
  
  // Optimización de imágenes
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Optimizar módulos externos
  experimental: {
    optimizePackageImports: ['react-calendar', 'lucide-react'],
  },
};

export default nextConfig;
