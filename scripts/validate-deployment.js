#!/usr/bin/env node

/**
 * Pre-deployment validation script
 * Checks if all required files and configurations are in place
 * Run this before deploying to Cloud Run
 */

import { existsSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const ROOT_DIR = join(__dirname, '..')

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m'
}

const log = {
  success: msg => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: msg => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  section: msg => console.log(`\n${colors.cyan}${msg}${colors.reset}`)
}

let hasErrors = false
let hasWarnings = false

// Check if file exists
function checkFile(path, required = true) {
  const fullPath = join(ROOT_DIR, path)
  const exists = existsSync(fullPath)

  if (exists) {
    log.success(`${path} found`)
    return true
  } else if (required) {
    log.error(`${path} not found (REQUIRED)`)
    hasErrors = true
    return false
  }
  log.warning(`${path} not found (optional)`)
  hasWarnings = true
  return false
}

// Check package.json dependencies
function checkPackageJson() {
  log.section('Checking package.json...')

  const packagePath = join(ROOT_DIR, 'package.json')
  if (!existsSync(packagePath)) {
    log.error('package.json not found')
    hasErrors = true
    return
  }

  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))

  // Check required scripts
  const requiredScripts = ['start', 'test', 'lint']
  for (const script of requiredScripts) {
    if (pkg.scripts && pkg.scripts[script]) {
      log.success(`Script "${script}" defined`)
    } else {
      log.error(`Script "${script}" not found`)
      hasErrors = true
    }
  }

  // Check Node version
  if (pkg.engines && pkg.engines.node) {
    log.success(`Node version specified: ${pkg.engines.node}`)
  } else {
    log.warning('Node version not specified in engines field')
    hasWarnings = true
  }

  // Check required dependencies
  const requiredDeps = ['express', 'mongoose', 'jsonwebtoken', 'bcryptjs', 'cors', 'dotenv']

  for (const dep of requiredDeps) {
    if (pkg.dependencies && pkg.dependencies[dep]) {
      log.success(`Dependency "${dep}" installed`)
    } else {
      log.error(`Dependency "${dep}" not found`)
      hasErrors = true
    }
  }
}

// Check Dockerfile
function checkDockerfile() {
  log.section('Checking Dockerfile...')

  const dockerfilePath = join(ROOT_DIR, 'Dockerfile')
  if (!existsSync(dockerfilePath)) {
    log.error('Dockerfile not found')
    hasErrors = true
    return
  }

  const content = readFileSync(dockerfilePath, 'utf8')

  // Check multi-stage build
  if (content.includes('AS production')) {
    log.success('Multi-stage build configured')
  } else {
    log.warning('Multi-stage build not found')
    hasWarnings = true
  }

  // Check EXPOSE port
  if (content.includes('EXPOSE 8080')) {
    log.success('Port 8080 exposed')
  } else {
    log.error('Port 8080 not exposed')
    hasErrors = true
  }

  // Check non-root user
  if (content.includes('USER nodejs') || content.includes('USER node')) {
    log.success('Non-root user configured')
  } else {
    log.warning('Running as root user (security risk)')
    hasWarnings = true
  }

  // Check CMD
  if (content.includes('CMD') && content.includes('node')) {
    log.success('CMD directive found')
  } else {
    log.error('CMD directive not found or incorrect')
    hasErrors = true
  }
}

// Check GitHub Actions workflow
function checkGitHubActions() {
  log.section('Checking GitHub Actions...')

  const workflowPath = join(ROOT_DIR, '.github/workflows/deploy-cloudrun.yml')
  if (!existsSync(workflowPath)) {
    log.warning('deploy-cloudrun.yml not found')
    log.info('You can still deploy manually')
    hasWarnings = true
    return
  }

  const content = readFileSync(workflowPath, 'utf8')

  // Check required secrets
  const requiredSecrets = ['GCP_SA_KEY', 'GCP_PROJECT_ID']

  for (const secret of requiredSecrets) {
    if (content.includes(secret)) {
      log.success(`Secret "${secret}" referenced`)
    } else {
      log.warning(`Secret "${secret}" not found in workflow`)
      hasWarnings = true
    }
  }

  // Check workflow triggers
  if (content.includes('push:') && content.includes('branches')) {
    log.success('Push trigger configured')
  } else {
    log.warning('Push trigger not configured')
    hasWarnings = true
  }
}

// Check environment variables template
function checkEnvExample() {
  log.section('Checking environment variables...')

  const envExamplePath = join(ROOT_DIR, 'env.example')
  if (!existsSync(envExamplePath)) {
    log.warning('env.example not found')
    hasWarnings = true
    return
  }

  const content = readFileSync(envExamplePath, 'utf8')

  const requiredVars = ['MONGODB_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'PORT', 'NODE_ENV']

  for (const varName of requiredVars) {
    if (content.includes(varName)) {
      log.success(`${varName} documented`)
    } else {
      log.error(`${varName} not found in env.example`)
      hasErrors = true
    }
  }
}

// Check required source files
function checkSourceFiles() {
  log.section('Checking source files...')

  checkFile('index.js', true)
  checkFile('src/app.js', true)
  checkFile('src/config/database.js', true)
  checkFile('src/config/redis.js', true)
  checkFile('src/models/User.js', true)
  checkFile('src/models/Note.js', true)
  checkFile('src/controllers/authController.js', true)
  checkFile('src/controllers/noteController.js', true)
  checkFile('src/services/authService.js', true)
}

// Check test configuration
function checkTests() {
  log.section('Checking test configuration...')

  checkFile('jest.config.js', true)

  const jestPath = join(ROOT_DIR, 'jest.config.js')
  if (existsSync(jestPath)) {
    const content = readFileSync(jestPath, 'utf8')
    if (content.includes('testEnvironment')) {
      log.success('Test environment configured')
    } else {
      log.warning('Test environment not configured')
      hasWarnings = true
    }
  }
}

// Main validation
async function validate() {
  console.log(`\n${'='.repeat(60)}`)
  console.log('   Pre-Deployment Validation for Cloud Run')
  console.log('='.repeat(60))

  checkPackageJson()
  checkDockerfile()
  checkGitHubActions()
  checkEnvExample()
  checkSourceFiles()
  checkTests()

  // Check optional files
  log.section('Checking optional files...')
  checkFile('.dockerignore', false)
  checkFile('.gcloudignore', false)
  checkFile('README.md', false)

  // Summary
  console.log(`\n${'='.repeat(60)}`)
  if (hasErrors) {
    log.error('Validation FAILED! Fix errors before deploying.')
    console.log('\nPlease fix the errors above and run validation again.')
    process.exit(1)
  } else if (hasWarnings) {
    log.warning('Validation passed with warnings.')
    console.log('\nWarnings are not critical but should be reviewed.')
    console.log('You can proceed with deployment.')
    process.exit(0)
  } else {
    log.success('All checks passed! Ready to deploy.')
    console.log('\nNext steps:')
    console.log('1. Commit and push to GitHub')
    console.log('2. GitHub Actions will automatically deploy to Cloud Run')
    console.log('3. Monitor deployment in GitHub Actions tab')
    process.exit(0)
  }
}

// Run validation
validate().catch(error => {
  log.error(`Validation script error: ${error.message}`)
  process.exit(1)
})
