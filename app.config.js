module.exports = ({ config }) => ({
  ...config,
  experiments: {
    ...config.experiments,
    ...(process.env.EXPO_BASE_PATH ? { baseUrl: process.env.EXPO_BASE_PATH } : {}),
  },
});
