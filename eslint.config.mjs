// @ts-check
import js from '@eslint/js';
import globals from 'globals';
import { FlatCompat } from '@eslint/eslintrc';
import prettier from 'eslint-plugin-prettier';
import importPlugin from 'eslint-plugin-import';
import preferArrow from 'eslint-plugin-prefer-arrow';
import jsdoc from 'eslint-plugin-jsdoc';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

export default [
  {
    ignores: ['src/mocks/**', 'src/database/migrations/**'],
  },
  js.configs.recommended,
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      prettier,
      import: importPlugin,
      'prefer-arrow': preferArrow,
      jsdoc,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
    rules: {
      // Prettier integration
      'prettier/prettier': 'error',
      // Import rules - enforce strict import organization
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import/no-unresolved': 'error',
      'import/no-unused-modules': 'error',
      'import/no-duplicates': 'error',
      'import/no-cycle': 'error',
      // Code quality rules
      'prefer-arrow/prefer-arrow-functions': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'error',
      'no-eval': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-script-url': 'error',
      // Function and class size limits (approximated with complexity rules)
      complexity: ['error', 5],
      'max-lines-per-function': ['error', 30],
      'max-params': ['error', 5],
      'max-depth': ['error', 4],
      // File size limits (approximated)
      'max-lines': ['error', 300],
      // JSDoc requirements
      'jsdoc/require-jsdoc': [
        'error',
        {
          publicOnly: true,
          require: {
            FunctionDeclaration: true,
            MethodDefinition: true,
            ClassDeclaration: true,
          },
        },
      ],
      'jsdoc/require-param': 'error',
      'jsdoc/require-returns': 'error',
      'jsdoc/require-description': 'error',
      // Security rules
      'no-unsafe-finally': 'error',
      'no-unsafe-optional-chaining': 'error',
      // Performance rules
      'no-loop-func': 'error',
      'no-new-object': 'error',
      'no-new-wrappers': 'error',
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      // Relaxed rules for test files
      'max-lines-per-function': ['error', 50],
      complexity: ['error', 8],
      'jsdoc/require-jsdoc': 'off',
      'no-console': 'off',
    },
  },
  {
    files: ['**/*.dto.ts', '**/*.entity.ts', '**/*.interface.ts'],
    rules: {
      // Relaxed rules for data structures
      'max-lines': ['error', 150],
      'jsdoc/require-jsdoc': 'off',
    },
  },
  {
    files: ['**/migrations/*.ts'],
    rules: {
      // Relaxed rules for migration files
      'max-lines': ['error', 600],
      'max-lines-per-function': ['error', 600],
      complexity: ['error', 20],
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-description': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/config/*.ts', '**/config/**/*.ts'],
    rules: {
      // Relaxed rules for configuration files
      'max-lines': ['error', 400],
      'max-lines-per-function': ['error', 50],
      complexity: ['error', 10],
      'jsdoc/require-jsdoc': 'off',
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
  {
    files: ['**/services/*.ts'],
    rules: {
      // Relaxed rules for service files
      'max-lines': ['error', 350],
      'max-lines-per-function': ['error', 40],
      complexity: ['error', 8],
      'no-console': 'warn',
    },
  },
  {
    files: ['**/filters/*.ts', '**/interceptors/*.ts'],
    rules: {
      // Relaxed rules for filters and interceptors
      'max-lines': ['error', 350],
      'max-lines-per-function': ['error', 40],
      complexity: ['error', 8],
      'no-console': 'warn',
    },
  },
  ...compat.extends('prettier'),
];
