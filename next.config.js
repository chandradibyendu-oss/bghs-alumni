/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile lucide-react to avoid missing vendor-chunk issues on some Windows setups
  transpilePackages: ['lucide-react'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

module.exports = nextConfig
