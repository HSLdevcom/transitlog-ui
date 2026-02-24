module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...(config.resolve.fallback || {}),
        path: require.resolve("path-browserify"),
      };
      return config;
    },
  },
};
