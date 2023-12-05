module.exports = {
  plugins: ['prettier', 'tailwindcss'],
  extends: [
    'next',
    'next/core-web-vitals',
    'plugin:tailwindcss/recommended',
    'prettier',
  ],
  rules: {
    'prettier/prettier': [
      'warn',
      {
        semi: true,
        singleQuote: true,
        tabWidth: 2,
        trailingComma: 'es5',
      },
    ],
  },
  overrides: [
    {
      files: '**/*.+(ts|tsx)',
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint/eslint-plugin'],
      extends: ['plugin:@typescript-eslint/recommended'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'tailwindcss/no-custom-classname': 'off',
      },
    },
  ],
};
