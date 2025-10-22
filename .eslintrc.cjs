// ESLint configuration - Minimal syntax like Go/Python
module.exports = {
  env: {
    node: true,
    es2022: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    // ============================================
    // MINIMAL SYNTAX (Go/Python Style)
    // ============================================
    
    // Code quality (Go style - simple and clear)
    'no-var': 'error', // Use const/let like Go's const/var
    'prefer-const': 'error', // Prefer const when possible
    'no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_'
    }],
    
    // Simple functions (Go style)
    'prefer-arrow-callback': 'error', // Arrow functions are cleaner
    'arrow-body-style': ['error', 'as-needed'], // Omit braces when possible
    'arrow-parens': ['error', 'as-needed'], // Omit parens when possible
    
    // Clean returns (Go style)
    'no-else-return': 'error', // Early returns
    'no-unneeded-ternary': 'error', // Simplify ternaries
    'no-return-await': 'off', // Allow for clarity
    
    // Destructuring (Python-like unpacking)
    'prefer-destructuring': ['error', {
      array: false,
      object: true
    }],
    
    // Template literals over concatenation
    'prefer-template': 'error',
    
    // Error handling (Go style)
    'prefer-promise-reject-errors': 'error',
    
    // Clean imports (Go style)
    'no-duplicate-imports': 'error',
    'sort-imports': ['error', {
      ignoreCase: true,
      ignoreDeclarationSort: true
    }],
    
    // Naming (relaxed for flexibility)
    'camelcase': ['error', {
      properties: 'never',
      ignoreDestructuring: true,
      ignoreImports: true
    }],
    
    // Console usage
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
    // Line length (PEP8 style)
    'max-len': ['warn', {
      code: 100,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreComments: true
    }],
    
    // Code style (minimal) - Let Prettier handle formatting
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],
    
    // Blocks (Go style)
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'curly': ['error', 'multi-line', 'consistent']
  },
  overrides: [
    {
      // Configuration for test files
      files: ['**/__tests__/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        // Relax some rules for test files
        'no-unused-vars': ['error', {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^mock|^Mock'
        }],
        'max-len': ['warn', {
          code: 120,
          ignoreUrls: true,
          ignoreStrings: true,
          ignoreTemplateLiterals: true,
          ignoreComments: true
        }],
        // Allow console.log in test files
        'no-console': 'off',
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    'coverage/',
    'uploads/',
    '*.config.js',
    '*.config.cjs',
    '*.config.mjs',
    'Dockerfile',
    'docker-compose*.yml',
    'Makefile',
    '.gitignore',
    '.dockerignore',
    '.editorconfig',
    '.prettierrc.js',
    '.prettierignore',
    '*.log',
    '.env*',
    '.DS_Store',
    'Thumbs.db'
  ]
}
