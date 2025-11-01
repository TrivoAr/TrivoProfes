const crypto = require('crypto');

/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Custom build ID generator to avoid nanoid issues
  generateBuildId: async () => {
    return crypto.randomBytes(16).toString('hex');
  },
  typescript: {
    ignoreBuildErrors: true, // TODO: Fix TypeScript errors and set to false
  },
  // Optimize performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    minimumCacheTTL: 60,
  },
  // Enable modern bundling
  experimental: {
    optimizePackageImports: [
      '@tanstack/react-query',
      'next-auth',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-toast',
      '@radix-ui/react-avatar',
      '@radix-ui/react-tabs',
      '@radix-ui/react-alert-dialog',
      'recharts',
      'date-fns',
      'react-day-picker',
      'mapbox-gl',
      'react-map-gl',
    ],
  },
};

module.exports = nextConfig;
