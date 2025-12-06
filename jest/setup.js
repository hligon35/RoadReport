// Jest setup for this React Native project.
// Provide lightweight, deterministic mocks for native modules used during unit tests.

// Ensure __DEV__ exists
if (typeof global.__DEV__ === 'undefined') global.__DEV__ = true;

// Use the official react-native jest mock as the top-level mock. This provides
// StyleSheet, View, Text, NativeModules, Dimensions, PixelRatio, etc.
try {
  jest.mock('react-native', () => {
    // require inside factory to satisfy jest mock constraints
    const rnMockInner = require('react-native/jest/mock');
      rnMockInner.Dimensions = rnMockInner.Dimensions || { get: () => ({ width: 1024, height: 768 }), addEventListener: () => {}, removeEventListener: () => {} };
      rnMockInner.PixelRatio = rnMockInner.PixelRatio || { get: () => 2, roundToNearestPixel: (n) => n };
      rnMockInner.Platform = rnMockInner.Platform || { OS: 'ios', select: (obj) => (obj.ios || obj.default || Object.values(obj)[0]) };
      rnMockInner.NativeModules = rnMockInner.NativeModules || {};
      // Ensure StyleSheet.create exists (some mocks may omit it)
      rnMockInner.StyleSheet = rnMockInner.StyleSheet || { create: (s) => s };
      // Ensure basic host components are present so testing-library can detect them
      const React = require('react');
      const make = (name) => ((props) => React.createElement(name, props));
      const hostNames = [
        'View', 'Text', 'Image', 'TouchableOpacity', 'TouchableHighlight', 'TouchableWithoutFeedback',
        'FlatList', 'SectionList', 'TextInput', 'SafeAreaView', 'Pressable', 'ScrollView', 'Modal', 'Button', 'ActivityIndicator', 'StatusBar'
      ];
      hostNames.forEach((n) => {
        rnMockInner[n] = rnMockInner[n] || make(n);
      });
    return rnMockInner;
  });
} catch (e) {
  // swallow
}

// Stub react-native-svg so imports don't hit native code.
try {
  jest.mock('react-native-svg', () => {
    const React = require('react');
    const { View } = require('react-native');
    const Mock = (props) => React.createElement(View, props, props.children);
    return {
      Svg: Mock,
      Circle: Mock,
      Ellipse: Mock,
      G: Mock,
      Line: Mock,
      Path: Mock,
      Polygon: Mock,
      Polyline: Mock,
      Rect: Mock,
      Text: Mock,
      Defs: Mock,
      Stop: Mock,
      ClipPath: Mock,
      LinearGradient: Mock,
      RadialGradient: Mock,
      use: Mock,
      // allow default import
      __esModule: true,
      default: Mock,
    };
  });
} catch (e) {}

// Mock @react-navigation/native to avoid pulling in native theming and platform code
try {
  jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    NavigationContainer: ({ children }) => children,
    createNavigationContainerRef: () => ({ current: null }),
    DefaultTheme: {},
    DarkTheme: {},
    useTheme: () => ({}),
    // mimic other exports used in code
    useIsFocused: () => true,
  }));
} catch (e) {}

// Mock expo/vector-icons to a simple component
try {
  jest.mock('@expo/vector-icons', () => ({
    Ionicons: ({ children, ...props }) => {
      const React = require('react');
      const { View } = require('react-native');
      return React.createElement(View, props, children || null);
    },
  }));
} catch (e) {}

// Silence native animated helper warnings by mocking if present
try {
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
} catch (e) {}

// Provide jest-native matchers when available
try {
  // eslint-disable-next-line global-require
  require('@testing-library/jest-native/extend-expect');
} catch (e) {}
// Minimal Jest setup for React Native in this project.
// - include gesture handler jest setup if available
// - silence NativeAnimatedHelper warning
// Provide __DEV__ for modules that reference it (React Native expects this global)
if (typeof global.__DEV__ === 'undefined') {
  global.__DEV__ = true;
}

// Some RN internals expect the FB batched bridge to exist in the environment.
if (typeof global.__fbBatchedBridgeConfig === 'undefined') {
  // Use an empty array for remoteModuleConfig to match what RN internals expect in tests
  global.__fbBatchedBridgeConfig = { remoteModuleConfig: [] };
}

// Provide a minimal Platform.select mock used by some navigation/theming utilities.
try {
  // eslint-disable-next-line global-require
  const Platform = require('react-native/Libraries/Utilities/Platform');
  if (!Platform.select) {
    Platform.select = (obj) => (obj.ios || obj.default || Object.values(obj)[0]);
  }
} catch (e) {
  // If Platform cannot be required, provide a lightweight mock on the global require cache
  try {
    jest.mock('react-native/Libraries/Utilities/Platform', () => ({
      OS: 'ios',
      select: (obj) => (obj.ios || obj.default || Object.values(obj)[0]),
    }));
  } catch (err) {}
}

// Ensure the top-level react-native export has a Platform.select implementation
try {
  // eslint-disable-next-line global-require
  const RN = require('react-native');
  if (!RN.Platform || !RN.Platform.select) {
    RN.Platform = { OS: 'ios', select: (obj) => (obj.ios || obj.default || Object.values(obj)[0]) };
  }
  // Ensure NativeModules exists to avoid TurboModuleRegistry errors
  RN.NativeModules = RN.NativeModules || {};
  // Ensure PixelRatio and Dimensions exist on top-level react-native to satisfy StyleSheet
  RN.PixelRatio = RN.PixelRatio || { get: () => 2, roundToNearestPixel: (n) => n };
  RN.Dimensions = RN.Dimensions || { get: () => ({ width: 1024, height: 768 }), addEventListener: () => {}, removeEventListener: () => {} };
} catch (e) {
  // ignore
}

// Try to apply react-native's jest setup utilities if available (provides native mocks)
try {
  // eslint-disable-next-line global-require
  require('react-native/jest/setup');
} catch (e) {
  // ignore if not present
}

// Prefer replacing the top-level 'react-native' module with the official jest mock
// and augment it with Platform/Dimensions/PixelRatio to avoid native TurboModule calls.
try {
  // eslint-disable-next-line global-require
  const RNJestMock = require('react-native/jest/mock');
  RNJestMock.Platform = RNJestMock.Platform || { OS: 'ios', select: (obj) => (obj.ios || obj.default || Object.values(obj)[0]) };
  RNJestMock.NativeModules = RNJestMock.NativeModules || {};
  RNJestMock.PixelRatio = RNJestMock.PixelRatio || { get: () => 2, roundToNearestPixel: (n) => n };
  RNJestMock.Dimensions = RNJestMock.Dimensions || { get: () => ({ width: 1024, height: 768 }), addEventListener: () => {}, removeEventListener: () => {} };
  // Register the mock so tests import it instead of the native module
  jest.doMock('react-native', () => RNJestMock);
} catch (e) {
  // ignore if not available
}

// Provide lightweight mocks for Dimensions and PixelRatio which are used by StyleSheet.
try {
  jest.mock('react-native/Libraries/Utilities/Dimensions', () => ({
    get: jest.fn(() => ({ width: 1024, height: 768 })),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
} catch (e) {}

try {
  jest.mock('react-native/Libraries/Utilities/PixelRatio', () => ({
    get: jest.fn(() => 2),
    roundToNearestPixel: jest.fn((n) => n),
  }));
} catch (e) {}

// Mock @react-navigation/native to avoid loading full navigation theming code during unit tests.
try {
  jest.mock('@react-navigation/native', () => ({
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
    NavigationContainer: ({ children }) => children,
    createNavigationContainerRef: () => ({ current: null }),
    DefaultTheme: {},
    DarkTheme: {},
    useTheme: () => ({}),
  }));
} catch (e) {}

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
