# Deployment Files Checklist

## ✅ Required Files for GitHub → Cloud Run Deployment

### Core Application Files

- ✅ `package.json` - Dependencies and scripts
- ✅ `package-lock.json` - Lock file for reproducible builds
- ✅ `index.js` - Application entry point
- ✅ `src/**` - All source code
- ✅ `env.example` - Environment variables template

### Docker & Build

- ✅ `Dockerfile` - Production Docker image configuration
- ✅ `.dockerignore` - Files to exclude from Docker build
- ✅ `.gcloudignore` - Files to exclude from Cloud Build (optional)

### GitHub Actions

- ✅ `.github/workflows/deploy-cloudrun.yml` - Auto deployment workflow
- ✅ `.github/workflows/node.js.yml` - CI/CD tests

### Configuration

- ✅ `.gitignore` - Files to exclude from git
- ✅ `jest.config.js` - Test configuration (for CI)
- ✅ `eslint.config.js` - Linting configuration (for CI)
- ✅ `babel.config.cjs` - Babel configuration (for tests)

### Documentation

- ✅ `README.md` - Project documentation
- ✅ `docs/GITHUB_CLOUDRUN_DEPLOYMENT.md` - Deployment guide
- ✅ `docs/DOCKERFILE_OPTIMIZATION.md` - Docker optimization details

## ❌ NOT Required (Can be deleted or kept locally)

### Local Development Only

- ❌ `docker-compose.yml` - Only for local Docker development
- ❌ `Dockerfile.k8s` - Only for Kubernetes deployment
- ❌ `Makefile` - Local automation shortcuts
- ❌ `k8s/**` - Kubernetes manifests (not used with Cloud Run)
- ❌ `nginx/**` - Nginx configs (Cloud Run handles routing)

### Alternative Deployment Methods

- ⚠️ `cloudbuild.yaml` - Only needed if using Cloud Build triggers
  - GitHub Actions deployment doesn't need this
  - Keep if you want both options
- ⚠️ `service.yaml` - Only for declarative Cloud Run deployment
  - GitHub Actions uses gcloud CLI instead
  - Can be removed if using GitHub Actions exclusively
- ⚠️ `scripts/deploy-cloudrun.ps1` - Only for manual deployment
  - Not needed with GitHub Actions
  - Keep for emergency manual deployments
- ⚠️ `scripts/setup-secrets.ps1` - Only needed once during initial setup
  - Keep for documentation purposes

### Local Testing Scripts

- ⚠️ `scripts/deploy-k8s.sh` - Kubernetes deployment
- ⚠️ `scripts/deploy-local.sh` - Local deployment

### Git Hooks (Optional)

- ⚠️ `.husky/**` - Git hooks for pre-commit checks
  - GitHub Actions runs checks anyway
  - Keep if you want local validation
- ⚠️ `commitlint.config.js` - Commit message linting
- ⚠️ `.lintstagedrc.js` - Staged files linting

### Editor Config (Optional)

- ⚠️ `.vscode/**` - VS Code settings
- ⚠️ `.editorconfig` - Editor configuration
- ⚠️ `.prettierrc.js` - Code formatting
- ⚠️ `.prettierignore` - Prettier ignore rules
- ⚠️ `.eslintrc.cjs` - Old ESLint config (replaced by eslint.config.js)

## 🎯 Minimal Production Setup

For **GitHub → Cloud Run** deployment, you technically only need:

```
note-taking-app/
├── .github/workflows/
│   └── deploy-cloudrun.yml       # Auto deployment
├── src/                          # Source code
├── Dockerfile                    # Docker image
├── .dockerignore                 # Docker build optimization
├── package.json                  # Dependencies
├── package-lock.json            # Lock file
├── index.js                      # Entry point
├── jest.config.js               # For CI tests
├── eslint.config.js             # For CI linting
├── babel.config.cjs             # For tests
├── env.example                   # Env vars template
└── README.md                     # Documentation
```

Everything else is **optional** for production deployment!

## 🗑️ Safe to Delete (for GitHub → Cloud Run only)

If you're **only** deploying via GitHub → Cloud Run:

```bash
# Delete local deployment files
rm -rf k8s/
rm -rf nginx/
rm docker-compose.yml
rm Dockerfile.k8s
rm Makefile
rm cloudbuild.yaml      # Only if not using Cloud Build triggers
rm service.yaml         # Only if using GitHub Actions deployment

# Delete local deployment scripts (keep for reference if needed)
rm scripts/deploy-k8s.sh
rm scripts/deploy-local.sh
rm scripts/deploy-cloudrun.sh
rm scripts/deploy-cloudrun.ps1  # Keep one for emergency manual deploys

# Delete git hooks (if not using locally)
rm -rf .husky/
rm commitlint.config.js
rm .lintstagedrc.js

# Delete redundant config
rm .eslintrc.cjs  # Using eslint.config.js instead
```

## ⚠️ Important Notes

1. **Keep `env.example`** - Documents required environment variables
2. **Keep `scripts/setup-secrets.ps1`** - Needed for initial Secret Manager setup
3. **Keep `.gitignore`** - Prevents committing sensitive files
4. **Keep test configs** - Needed for CI/CD pipeline
5. **Keep documentation** - Helpful for team members

## 🔄 Migration Path

If you want to switch from other deployment methods:

### From Cloud Build triggers → GitHub Actions:

- Keep: All files
- Delete: Nothing (Cloud Build can coexist)

### From manual deployment → GitHub Actions:

- Keep: `scripts/deploy-cloudrun.ps1` for emergencies
- Delete: Nothing (manual deployment can coexist)

### From Kubernetes → Cloud Run:

- Delete: `k8s/`, `Dockerfile.k8s`, `nginx/`
- Keep: Everything else

## 📝 Decision Matrix

| File                  | Keep?    | Reason                               |
| --------------------- | -------- | ------------------------------------ |
| `cloudbuild.yaml`     | Optional | Only if using Cloud Build triggers   |
| `service.yaml`        | Optional | Only if using declarative deployment |
| `docker-compose.yml`  | Optional | Only for local development           |
| `Makefile`            | Optional | Only for local shortcuts             |
| `k8s/**`              | No       | Not used with Cloud Run              |
| `nginx/**`            | No       | Cloud Run handles routing            |
| `.husky/**`           | Optional | Only if using git hooks locally      |
| `scripts/deploy-*.sh` | Optional | Only for manual deployment           |

## ✅ Recommendation

For a **clean production setup** with GitHub → Cloud Run:

1. **Keep everything for now** - Safe approach
2. **Delete K8s and nginx** - Definitely not needed
3. **Keep one manual deploy script** - For emergencies
4. **Keep documentation** - Always helpful
5. **Test deployment** - Before deleting anything

After successful deployment, you can safely remove files you don't use!
