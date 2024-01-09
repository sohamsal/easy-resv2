/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/pdfparse/:path*',
        destination: '/dataset/pdfparse/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
