// Extend jest expect with jest-native matchers when available
try {
  // eslint-disable-next-line global-require
  require('@testing-library/jest-native/extend-expect');
} catch (e) {
  // package not installed — tests relying on these matchers will be skipped or fail.
}
