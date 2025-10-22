// lint-staged configuration
module.exports = {
  // JavaScript files
  '*.js': ['eslint --fix', 'prettier --write'],

  // JSON, Markdown files
  '*.{json,md}': ['prettier --write']
}
