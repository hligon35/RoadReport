/**
 * Jest config for transforming React Native modules in this Expo project.
 * Keeps most node_modules ignored, but allows transforming a small list of RN-related packages.
 */
module.exports = {
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-picker|react-native-safe-area-context|@react-navigation/native|@react-navigation/bottom-tabs)/)'
  ],
  testEnvironment: 'jsdom',
  setupFiles: ['<rootDir>/jest/setup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest/setupTests.js'],
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json'],
};
// Keep only the RN-aware config above. No second export.
