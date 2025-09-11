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
      {
        protocol: 'https',
        hostname: 'pub-1a0e0250ddb54a4ba6cadf36a8208241.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'bghs-gallery.alumnibghs.org',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
}

module.exports = nextConfig
