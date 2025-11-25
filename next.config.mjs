/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://iframe.bubblemaps.io https://*.bubblemaps.io https://www.gmgn.cc https://www.muteswap.com;",
          },
        ],
      },
    ]
  },
}

export default nextConfig
