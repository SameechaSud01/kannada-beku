// Mock the AsyncStorage native module so suites that import the progress store
// (which imports AsyncStorage at module load) can run under jest (audit H8).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// @sentry/react-native ships ESM that jest doesn't transform, so any module that
// imports it (e.g. lib/logger, pulled in by the stores) would fail to parse.
// Stub it globally with no-op spies; suites needing assertions re-mock locally.
jest.mock('@sentry/react-native', () => ({
  init: jest.fn(),
  wrap: (c) => c,
  addBreadcrumb: jest.fn(),
  captureMessage: jest.fn(),
  captureException: jest.fn(),
  setUser: jest.fn(),
}));

// Reanimated's native worklet runtime doesn't exist under jest; the official
// mock renders Animated.* as plain views and no-ops the animation helpers, so
// component tests exercise render output and press handling, not motion.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

// Safe-area insets for components that call useSafeAreaInsets() (all insets 0).
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
