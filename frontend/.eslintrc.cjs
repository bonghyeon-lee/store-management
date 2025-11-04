module.exports = {
  root: true,
  env: { browser: true, es2021: true, node: true },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: { jsx: true },
    project: undefined,
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'simple-import-sort'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        project: './tsconfig.json',
      },
    },
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'import/order': 'off',
    'simple-import-sort/exports': 'error',
    'simple-import-sort/imports': 'error',
  },
  overrides: [
    {
      files: ['**/*.ts', '**/*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ],
};

module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: false,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: null,
  },
  plugins: ['boundaries', 'import', '@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        // respects tsconfig paths in ./tsconfig.json
        project: ['./tsconfig.json'],
      },
    },
    'boundaries/elements': [
      { type: 'app', pattern: 'src/app/**' },
      { type: 'pages', pattern: 'src/pages/**' },
      { type: 'widgets', pattern: 'src/widgets/**' },
      { type: 'features', pattern: 'src/features/*/**' },
      { type: 'entities', pattern: 'src/entities/*/**' },
      { type: 'shared', pattern: 'src/shared/**' },
    ],
  },
  rules: {
    'boundaries/element-types': [
      'error',
      {
        default: 'disallow',
        rules: [
          { from: 'app', allow: ['pages', 'widgets', 'features', 'entities', 'shared'] },
          { from: 'pages', allow: ['widgets', 'features', 'entities', 'shared'] },
          { from: 'widgets', allow: ['features', 'entities', 'shared'] },
          { from: 'features', allow: ['entities', 'shared'] },
          { from: 'entities', allow: ['shared'] },
          { from: 'shared', disallow: ['app', 'pages', 'widgets', 'features', 'entities'] },
        ],
      },
    ],
    'import/no-internal-modules': [
      'error',
      {
        forbid: [
          {
            pattern: 'src/(features|entities)/*/**',
          },
        ],
        allow: [
          'src/features/*',
          'src/entities/*',
          'src/shared/**',
          'src/app/**',
          'src/pages/**',
          'src/widgets/**',
        ],
      },
    ],
  },
};
