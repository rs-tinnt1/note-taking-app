// eslint.config.js (ESLint 9+ Flat Config)
import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2021,
        ...globals.jest, // Thêm Jest globals
      },
    },
    rules: {
      // ============================================
      // MINIMAL SYNTAX
      // ============================================
      
      // No semicolons
      'semi': ['error', 'never'],
      'semi-spacing': ['error', { before: false, after: true }],
      
      // Single quotes
      'quotes': ['error', 'single', { avoidEscape: true }],
      
      // No trailing commas
      'comma-dangle': ['error', 'never'],
      
      // Consistent spacing
      'indent': ['error', 2, { SwitchCase: 1 }],
      'space-before-function-paren': ['error', {
        anonymous: 'always',
        named: 'never',
        asyncArrow: 'always'
      }],
      'space-before-blocks': 'error',
      'keyword-spacing': 'error',
      'comma-spacing': 'error',
      'key-spacing': 'error',
      'object-curly-spacing': ['error', 'always'],
      'array-bracket-spacing': ['error', 'never'],
      
      // Clean code style
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],
      'padded-blocks': ['error', 'never'],
      
      // Simple arrow functions (Go-like)
      'arrow-parens': ['error', 'as-needed'],
      'arrow-body-style': ['error', 'as-needed'],
      'arrow-spacing': 'error',
      'prefer-arrow-callback': 'error',
      
      // No var, use const/let (like Go's const/var)
      'no-var': 'error',
      'prefer-const': 'error',
      
      // Template literals over concatenation
      'prefer-template': 'error',
      'template-curly-spacing': 'error',
      
      // Destructuring when possible (Python-like unpacking)
      'prefer-destructuring': ['error', {
        array: false,
        object: true
      }],
      
      // Simple returns (Go style)
      'no-else-return': 'error',
      'no-unneeded-ternary': 'error',
      
      // Clean imports (Go-like)
      'no-duplicate-imports': 'error',
      'sort-imports': ['error', {
        ignoreCase: true,
        ignoreDeclarationSort: true
      }],
      
      // Error handling
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      
      // Consistent naming (Go snake_case simulation)
      'camelcase': ['error', {
        properties: 'never',
        ignoreDestructuring: true,
        ignoreImports: true
      }],
      
      // No console in production (but allow in dev)
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      
      // Async/await over promises (cleaner like Go)
      'prefer-promise-reject-errors': 'error',
      'no-return-await': 'off', // Allow for clarity
      
      // Spacing consistency
      'space-infix-ops': 'error',
      'space-in-parens': ['error', 'never'],
      'computed-property-spacing': ['error', 'never'],
      
      // Clean blocks
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
      'curly': ['error', 'multi-line', 'consistent'],
      
      // Max line length (Python PEP8 style)
      'max-len': ['warn', {
        code: 100,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true
      }]
    }
  },
  {
    // Cấu hình riêng cho test files
    files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.jest, // Jest globals cho test files
      },
    },
    rules: {
      // Relax một số rules cho test files
      'no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_|^mock|^Mock'
      }],
      'max-len': ['warn', {
        code: 120, // Tăng độ dài dòng cho test files
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreComments: true
      }],
      // Cho phép console.log trong test files
      'no-console': 'off',
    }
  },
  {
    // Ignore patterns
    ignores: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js'
    ]
  }
]