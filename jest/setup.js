// Minimal Jest setup for React Native in this project.
// - include gesture handler jest setup if available
// - silence NativeAnimatedHelper warning

try {
  // react-native-gesture-handler provides a jest setup file; require if installed
  // eslint-disable-next-line global-require
  require('react-native-gesture-handler/jestSetup');
} catch (e) {
  // ignore if not installed
}

// Mock out native animated helper to avoid warning about useNativeDriver
// Try multiple known locations for the NativeAnimatedHelper depending on RN version.
try {
  // eslint-disable-next-line global-require
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (e1) {
  try {
    // eslint-disable-next-line global-require
    jest.mock('react-native/Libraries/Animated/src/NativeAnimatedHelper');
  } catch (e2) {
    // If neither exists, ignore — tests can continue without this mock.
  }
}
