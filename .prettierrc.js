// Prettier configuration for minimal syntax (Go/Python style)
export default {
  // Basic formatting
  semi: false, // No semicolons (Go style)
  singleQuote: true, // Single quotes (Python style)
  trailingComma: 'none', // No trailing commas (Go style)

  // Indentation (Python style)
  tabWidth: 2,
  useTabs: false,

  // Line length (PEP8 style)
  printWidth: 100,

  // Bracket spacing
  bracketSpacing: true,
  bracketSameLine: false,

  // Arrow functions (Go style)
  arrowParens: 'avoid', // (x) => x instead of (x) => x

  // End of line
  endOfLine: 'lf',

  // Quote props only when needed
  quoteProps: 'as-needed',

  // JSX (if needed)
  jsxSingleQuote: true,

  // Prose wrap
  proseWrap: 'preserve',

  // HTML whitespace
  htmlWhitespaceSensitivity: 'css',

  // Vue files
  vueIndentScriptAndStyle: false,

  // Embedded language formatting
  embeddedLanguageFormatting: 'auto'
}
