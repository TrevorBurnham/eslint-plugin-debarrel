import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default [
  {
    ignores: ['.eslintrc.cjs'],
  },
  {
    files: ['**/*.ts', '**/*.js', '**/*.cjs'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: join(__dirname, 'tsconfig.json'),
        tsconfigRootDir: __dirname,
        ecmaVersion: 2020,
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      'debarrel': null, // This will be injected in the test
    },
    rules: {
      'debarrel/debarrel': ['error', {
        patterns: [{
          barrel: '@test/barrel',
          transformPattern: '@test/barrel/{{importName}}',
        }],
      }],
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
  },
];
