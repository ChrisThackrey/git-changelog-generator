import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default [
  // Global ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },

  // Base configuration for all JavaScript files
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      'no-console': 'off', // Allow console for this CLI tool
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
    },
  },

  // TypeScript configuration (only for .ts files in src directory)
  ...tseslint.configs.recommendedTypeChecked.map(config => ({
    ...config,
    files: ['src/**/*.ts'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  })),

  // Additional TypeScript-specific rules
  {
    files: ['src/**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      'quotes': ['error', 'single'],
      'semi': ['error', 'always'],
      'no-console': 'off', // Allow console for this CLI tool
    },
  },
];

