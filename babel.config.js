module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    env: {
      production: {
        // Remove console.* in production bundles to reduce noise and tiny size wins
        plugins: ['babel-plugin-transform-remove-console'],
      },
    },
  };
};
