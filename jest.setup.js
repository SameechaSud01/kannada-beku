// Mock the AsyncStorage native module so suites that import the progress store
// (which imports AsyncStorage at module load) can run under jest (audit H8).
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
