/** @type {import('next').NextConfig} */
// const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://187.127.132.226:9000"

const BACKEND_BASE_URL = process.env.BACKEND_BASE_URL || "http://127.0.0.1:8000"

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
        destination: `${BACKEND_BASE_URL}/api/:path*`,
      },
      {
        source: '/api/external/assessment-report/create',
        destination: `${BACKEND_BASE_URL}/api/assessment-report/create`,
      },
      {
        source: '/api/external/assessment-status/create',
        destination: `${BACKEND_BASE_URL}/api/assessment-status/create`,
      },
      {
        source: '/api/external/user-login',
        destination: `${BACKEND_BASE_URL}/api/user/login`,
      },
      {
        source: '/api/external/:path*',
        destination: `${BACKEND_BASE_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
