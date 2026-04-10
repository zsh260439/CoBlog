// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  // 👇 关键：移除 eslintPluginPrettierRecommended，或者单独关闭
  // eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
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
      
      // 👇 彻底关闭 Prettier 所有格式检查
      "prettier/prettier": "off",
      
      // 关闭 ESLint 自带的格式检查
      "indent": "off",
      "semi": "off",
      "quotes": "off",
      "comma-spacing": "off",
      "no-trailing-spaces": "off",
      "no-multiple-empty-lines": "off",
      "eol-last": "off",
      "space-before-function-paren": "off",
      "keyword-spacing": "off",
      "object-curly-spacing": "off",
      "array-bracket-spacing": "off"
    },
  },
);