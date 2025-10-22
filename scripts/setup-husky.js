#!/usr/bin/env node

// Setup script for Husky with Node.js version compatibility
import { execSync } from 'child_process'
import { chmodSync, existsSync } from 'fs'

try {
  // Check if .husky directory exists
  if (!existsSync('.husky')) {
    console.log('Initializing Husky...')
    execSync('npx husky init', { stdio: 'inherit' })
  }

  // Make sure pre-commit hook is executable
  const preCommitPath = '.husky/pre-commit'
  if (existsSync(preCommitPath)) {
    chmodSync(preCommitPath, '755')
    console.log('✅ Pre-commit hook is ready')
  }

  // Make sure commit-msg hook is executable
  const commitMsgPath = '.husky/commit-msg'
  if (existsSync(commitMsgPath)) {
    chmodSync(commitMsgPath, '755')
    console.log('✅ Commit-msg hook is ready')
  }

  console.log('🎉 Husky setup completed successfully!')
} catch (error) {
  console.warn('⚠️  Husky setup failed, but continuing...')
  console.warn('Error:', error.message)
}
