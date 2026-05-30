/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['mongoose', 'mongodb'],
  },
  webpack: (config) => {
    config.externals.push('mongoose', 'mongodb')
    return config
  },
}

module.exports = nextConfig