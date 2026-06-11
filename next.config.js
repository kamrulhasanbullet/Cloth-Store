/** @type {import('next').NextConfig} **/
const nextConfig = {
  images: { unoptimized: true },
  experimental: {
    serverActions: true,
  },
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      {
        module: /node_modules[\\/]@supabase[\\/]supabase-js[\\/]dist[\\/]index\.cjs/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];

    return config;
  },
};

module.exports = nextConfig;
