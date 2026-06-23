/** @type {import('next').NextConfig} */
function normalizeBackendBaseUrl(url) {
  return (url || "https://api.psychometricevaluation.com")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api$/i, "")
}

const BACKEND_BASE_URL = normalizeBackendBaseUrl(process.env.BACKEND_BASE_URL)

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
