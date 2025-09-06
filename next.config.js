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
      {
        protocol: 'https',
        hostname: 'alumnibghs.org',
      },
      {
        protocol: 'https',
        hostname: 'r2.alumnibghs.org',
      },
      {
        protocol: 'https',
        hostname: 'pub-12011e6d961a440ad2d8f07187ee8319.r2.dev',
      },
    ],
  },
}

module.exports = nextConfig
