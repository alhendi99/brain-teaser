/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Only use relative paths in production (for Cordova)
  // In development, use default absolute paths
  assetPrefix: isProd ? './' : '',
  basePath: '',
};

module.exports = nextConfig;
