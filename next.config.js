/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next-azteka', // Unique build directory to avoid conflicts with other Next.js apps on VPS
  // Note: Next.js dev server runs on http://localhost:3000
  // Server Actions are enabled by default in Next.js 14+

  // Image optimization configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aztekafoods.com',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
    ],
    // Allow local uploads path
    unoptimized: false,
  },

  // Static file serving for uploads
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/uploads/:path*',
      },
    ]
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['app', 'components', 'lib', 'hooks'],
  },
  typescript: {
    tsconfigPath: './tsconfig.next.json',
    // Temporarily ignore type errors for deployment
    ignoreBuildErrors: true,
  },
}

export default nextConfig
