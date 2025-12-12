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
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()'
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.supabase.co",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data: https://fonts.gstatic.com",
              "connect-src 'self' https://*.supabase.co https://*.alumnibghs.org wss://*.supabase.co",
              "frame-src 'self' https://*.supabase.co",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'self'",
              "upgrade-insecure-requests"
            ].join('; ')
          }
        ],
      },
    ]
  },
}

module.exports = nextConfig
