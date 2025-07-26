import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // i18n native Next.js settings
  i18n: {
    locales: ['fr', 'en'],
    defaultLocale: 'fr',
    localeDetection: true,
  },
  
  // Capacitor settings
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  output: process.env.BUILD_MOBILE ? 'export' : undefined,
  distDir: process.env.BUILD_MOBILE ? 'out' : '.next',
  
  // Mobile build settings
  experimental: {
    optimizePackageImports: ['@chakra-ui/react', 'lucide-react']
  },
  
  // Capacitor Webpack configuration
  webpack: (config, { dev, isServer }) => {
    if (!isServer && !dev) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default nextConfig;