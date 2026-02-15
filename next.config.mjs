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
        source: '/api/local/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*',
      },
      {
        source: '/api/external/assessment-report/create',
        destination: 'http://52.207.90.22:8000/api/assessment-report/create',
      },
      {
        source: '/api/external/assessment-status/create',
        destination: 'http://52.207.90.22:8000/api/assessment-status/create',
      },
      {
        source: '/api/external/user-login',
        destination: 'http://52.207.90.22:8000/api/user-login',
      },
      {
        source: '/token',
        destination: 'http://52.207.90.22:8000/api/token',
      },
      {
        source: '/api/external/:path*',
        destination: 'http://52.207.90.22:8000/api/:path*',
      },
    ]
  },
}

export default nextConfig
