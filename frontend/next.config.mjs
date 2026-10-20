/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
        ],
      },
    ]
  },
  async rewrites() {
    const backend = process.env.BACKEND_API_URL?.replace(/\/+$/, '')
    if (!backend) return []
    return [{ source: '/api/:path*', destination: `${backend}/api/:path*` }, { source: '/media/:path*', destination: `${backend}/media/:path*` }]
  },
}

export default nextConfig
