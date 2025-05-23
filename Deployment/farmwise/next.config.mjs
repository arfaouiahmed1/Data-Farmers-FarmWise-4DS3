import bundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer({
  reactStrictMode: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    optimizePackageImports: ['@mantine/core', '@mantine/hooks'],
  },
  async rewrites() {
    return [
      {
        source: '/core/:path*',
        destination: 'http://localhost:8000/core/:path*', // Proxy /core paths to Django backend
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Proxy to Django backend
      },
      // Add specific rewrites for disease and weed detection
      {
        source: '/detect-disease',
        destination: 'http://localhost:8000/api/detect-disease/',
      },
      {
        source: '/detect-disease/',
        destination: 'http://localhost:8000/api/detect-disease/',
      },
      {
        source: '/detect-weeds',
        destination: 'http://localhost:8000/api/detect-weeds/',
      },
      {
        source: '/detect-weeds/',
        destination: 'http://localhost:8000/api/detect-weeds/',
      },
      // Add treatment chat API endpoint
      {
        source: '/api/chat-treatment',
        destination: 'http://localhost:8000/api/chat-treatment/',
      },
      {
        source: '/api/chat-treatment/',
        destination: 'http://localhost:8000/api/chat-treatment/',
      },
    ];
  },
});
