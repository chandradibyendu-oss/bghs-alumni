/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpile lucide-react. React-PDF is externalized below, not transpiled.
  transpilePackages: ['lucide-react'],
  experimental: {
    // Ensure libraries are externalized for server components runtime
    serverComponentsExternalPackages: ['@sparticuz/chromium', 'puppeteer-core', '@react-pdf/renderer']
  },
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
        hostname: 'upload.wikimedia.org',
      },
    ],
  },
}

module.exports = nextConfig
