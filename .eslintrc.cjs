const eslintExtends = [
  'airbnb-typescript/base',
];
const parser = '@typescript-eslint/parser';
const parserOptions = {
  tsconfigRootDir: __dirname,
  project: ['./tsconfig.json', './tsconfig.lint.json'],
};
const plugins = [
  '@typescript-eslint',
];
const root = true;
const rules = {
  '@typescript-eslint/lines-between-class-members': 'off',
  '@typescript-eslint/naming-convention': [
    'error',
    {
      format: ['camelCase'],
      leadingUnderscore: 'allow',
      selector: ['variable'],
    },
  ],
  '@typescript-eslint/no-unused-vars': [
    'error',
    { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
  ],
  '@typescript-eslint/quotes': [
    'error',
    'single',
    { allowTemplateLiterals: true, avoidEscape: true },
  ],
  'arrow-parens': ['error', 'as-needed'],
  'import/export': 'off',
  'import/prefer-default-export': 'off',
  'lines-between-class-members': 'off',
  'no-console': 'off',
  'no-control-regex': 'off',
  'object-curly-newline': ['error', { consistent: true }],
  'spaced-comment': ['error', 'always', { block: { exceptions: ['*'] } }],
  'wrap-iife': ['error', 'inside'],
};

module.exports = {
  parser,
  parserOptions,
  plugins,
  root,
  rules,
  extends: eslintExtends,
};
