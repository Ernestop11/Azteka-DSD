/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next-azteka', // Unique build directory to avoid conflicts with other Next.js apps on VPS
  // Note: Next.js dev server runs on http://localhost:3000
  // Server Actions are enabled by default in Next.js 14+

  // Externalize native node modules for server components
  // This fixes webpack issues with onnxruntime-node (used by @imgly/background-removal-node)
  // Use experimental.serverComponentsExternalPackages for Next.js 14.x compatibility
  experimental: {
    serverComponentsExternalPackages: [
      '@imgly/background-removal-node',
      'onnxruntime-node',
      'sharp',
      'heic-convert',
    ],
  },

  // Webpack config to handle native modules
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Don't bundle these packages, they will be required at runtime
      config.externals = config.externals || []
      config.externals.push({
        '@imgly/background-removal-node': 'commonjs @imgly/background-removal-node',
        'onnxruntime-node': 'commonjs onnxruntime-node',
        'heic-convert': 'commonjs heic-convert',
      })
    }
    return config
  },

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
