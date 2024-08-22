const nextConfig = {
  webpack: (config, options) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
    };

    return config;
  },
};

module.exports = nextConfig;