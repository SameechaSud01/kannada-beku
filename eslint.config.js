// Flat config for ESLint 9. Extends Expo's recommended rules and disables
// stylistic rules that conflict with Prettier (formatting is Prettier's job).
const expoConfig = require('eslint-config-expo/flat');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  ...expoConfig,
  eslintConfigPrettier,
  {
    ignores: [
      'node_modules/**',
      '.expo/**',
      'dist/**',
      'web-build/**',
      'build/**',
      'ios/**',
      'android/**',
      'web/**',
      'scripts/**',
      // Design/spec handoff artifacts — reference material, not app source.
      'spec_docs/**',
      'design_handoff_system_states/**',
      'design_handoff_chunky_v3/**',
      'design_handoff_onboarding_audit/**',
      '.agents/**',
      'docs/**',
      '*.config.js',
      'jest.setup.js',
    ],
  },
  {
    rules: {
      // Warn (don't error) on stray console calls — babel strips them in prod,
      // but they shouldn't pile up unnoticed.
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Irrelevant for React Native: apostrophes in <Text> render fine, and
      // escaping them would surface literal entities on screen.
      'react/no-unescaped-entities': 'off',
    },
  },
];
