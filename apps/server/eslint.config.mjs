// @ts-check
import * as eslint from '@eslint/js';
import * as globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': 'off',
      'indent': 'off',
      'semi': 'off',
      'quotes': 'off',
      'comma-spacing': 'off',
      'no-trailing-spaces': 'off',
      'no-multiple-empty-lines': 'off',
      'eol-last': 'off',
      'space-before-function-paren': 'off',
      'keyword-spacing': 'off',
      'object-curly-spacing': 'off',
      'array-bracket-spacing': 'off'
    },
  },
)
