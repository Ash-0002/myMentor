/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/external/:path*',
        destination: 'http://52.207.90.22:8000/api/:path*',
      },
    ]
  },
}

export default nextConfig
