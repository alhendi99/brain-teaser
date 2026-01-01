/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Use relative paths in production for mobile app compatibility
  assetPrefix: isProd ? './' : '',
  basePath: '',
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
