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
