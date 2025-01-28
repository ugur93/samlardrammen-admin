import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
  {
    languageOptions: {
      globals: globals.browser, parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintPluginPrettierRecommended,
  {
    rules: {
      'react/react-in-jsx-scope': 'off',
      'prettier/prettier': [
        'warn',
        {
          singleQuote: true,
          printWidth: 120,
          endOfLine: 'auto',
          tabWidth: 4,
          trailingComma: 'es5',
        },
      ],
    },
  },
];
