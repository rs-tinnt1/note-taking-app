# GitHub to Cloud Run Deployment Guide

## 🚀 Overview

This guide explains how to automatically deploy your Note Taking App to Google Cloud Run when you push code to GitHub's master branch.

## 📋 Prerequisites

1. **Google Cloud Project** with billing enabled
2. **GitHub Repository** with your code
3. **Google Cloud CLI** installed locally

## 🔧 Setup Steps

### 1. Enable Required APIs in Google Cloud

```bash
# Set your project ID
export PROJECT_ID="your-project-id"
gcloud config set project $PROJECT_ID

# Enable required APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com
```

### 2. Create Service Account for GitHub Actions

```bash
# Create service account
gcloud iam service-accounts create github-actions \
    --description="Service account for GitHub Actions deployments" \
    --display-name="GitHub Actions"

# Get the service account email
export SA_EMAIL="github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

# Grant necessary roles
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" \
    --role="roles/secretmanager.secretAccessor"
```

### 3. Create and Download Service Account Key

```bash
# Create key file
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=$SA_EMAIL

# IMPORTANT: Keep this file secure! Don't commit it to git!
```

### 4. Create Secrets in Google Secret Manager

```bash
# If you haven't created secrets yet, use the setup script
.\scripts\setup-secrets.ps1

# Or create them manually
echo -n "your-mongodb-uri" | gcloud secrets create MONGODB_URI --data-file=-
echo -n "your-jwt-secret" | gcloud secrets create JWT_SECRET --data-file=-
echo -n "your-jwt-refresh-secret" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-
echo -n "redis://host:6379" | gcloud secrets create REDIS_URL --data-file=-
echo -n "SG.your-key" | gcloud secrets create SENDGRID_API_KEY --data-file=-
echo -n "noreply@yourdomain.com" | gcloud secrets create FROM_EMAIL --data-file=-
```

### 5. Grant Cloud Run Service Account Access to Secrets

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

# Grant access to each secret
for SECRET in MONGODB_URI JWT_SECRET JWT_REFRESH_SECRET REDIS_URL SENDGRID_API_KEY FROM_EMAIL; do
  gcloud secrets add-iam-policy-binding $SECRET \
    --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
    --role="roles/secretmanager.secretAccessor"
done
```

### 6. Add Secrets to GitHub Repository

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add the following:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `GCP_SA_KEY` | Contents of `github-actions-key.json` | Service account key (entire JSON) |
| `GCP_PROJECT_ID` | Your GCP project ID | Example: `my-project-123456` |
| `GCP_REGION` | Deployment region | Example: `asia-southeast1` |

**How to add GCP_SA_KEY:**
```bash
# Windows PowerShell
Get-Content github-actions-key.json | Set-Clipboard

# Linux/Mac
cat github-actions-key.json | pbcopy  # Mac
cat github-actions-key.json | xclip   # Linux
```
Then paste the entire JSON content into the GitHub secret.

### 7. Test the Deployment

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Setup Cloud Run deployment"
   git push origin master
   ```

2. **Monitor the deployment:**
   - Go to your repository on GitHub
   - Click on **Actions** tab
   - Watch the workflow run

3. **Check Cloud Run:**
   ```bash
   # Get service URL
   gcloud run services describe note-taking-api \
       --region=asia-southeast1 \
       --format='value(status.url)'

   # Test the deployment
   curl https://your-service-url/health
   ```

## 🔄 Workflow Explanation

The deployment happens in 2 stages:

### Stage 1: Test (runs on every push/PR)
```yaml
jobs:
  test:
    - Checkout code
    - Setup Node.js 18.x
    - Install dependencies
    - Run linter
    - Run tests
```

### Stage 2: Deploy (only on master branch)
```yaml
jobs:
  deploy:
    needs: test  # Only runs if tests pass
    - Checkout code
    - Setup Google Cloud SDK
    - Build Docker image
    - Push to Container Registry
    - Deploy to Cloud Run
```

## 📊 Monitoring & Logs

### View deployment logs:
```bash
# GitHub Actions logs
# Go to: https://github.com/YOUR_USERNAME/note-taking-app/actions

# Cloud Run logs
gcloud run services logs read note-taking-api \
    --region=asia-southeast1 \
    --limit=50
```

### Monitor service health:
```bash
# Get service details
gcloud run services describe note-taking-api \
    --region=asia-southeast1

# Check health endpoint
curl $(gcloud run services describe note-taking-api \
    --region=asia-southeast1 \
    --format='value(status.url)')/health
```

## 🛠️ Customization

### Change deployment region:
Update `.github/workflows/deploy-cloudrun.yml`:
```yaml
env:
  REGION: us-central1  # Change this
```

### Adjust resources:
Modify the deploy step:
```yaml
--memory 1Gi \
--cpu 2 \
--max-instances 20 \
```

### Enable authentication:
Remove `--allow-unauthenticated` flag to require authentication.

### Custom domain:
```bash
gcloud run domain-mappings create \
    --service note-taking-api \
    --domain api.yourdomain.com \
    --region asia-southeast1
```

## 🔒 Security Best Practices

1. ✅ **Service account key is stored in GitHub Secrets** (never in code)
2. ✅ **All sensitive data in Secret Manager** (not in environment variables)
3. ✅ **Non-root user in Docker** (nodejs:1001)
4. ✅ **HTTPS only** (Cloud Run default)
5. ✅ **Automatic security updates** (Alpine base image)

## 🚨 Troubleshooting

### Deployment fails with "Permission denied"
- Check service account has all required roles
- Verify GitHub secret `GCP_SA_KEY` is valid JSON

### "Secret not found" error
- Ensure all secrets exist in Secret Manager
- Check secret names match exactly (case-sensitive)
- Verify Cloud Run service account has `secretAccessor` role

### Application won't start
- Check logs: `gcloud run services logs read note-taking-api --region=asia-southeast1`
- Verify MongoDB connection string is correct
- Test locally first: `npm start`

### Build takes too long
- Enable BuildKit caching (already configured)
- Use GitHub Actions cache for dependencies

## 💰 Cost Optimization

1. **Use Cloud Run's pay-per-use model:**
   - Min instances: 0 (no idle cost)
   - Max instances: 10 (prevent runaway costs)
   - CPU throttling: Enabled (reduce idle CPU cost)

2. **Optimize image size:**
   - Current: ~180MB (already optimized)
   - Multi-stage build (already implemented)

3. **Monitor usage:**
   ```bash
   # Check current costs
   gcloud billing accounts list
   gcloud billing projects describe $PROJECT_ID
   ```

## 📚 Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [GitHub Actions with Google Cloud](https://github.com/google-github-actions)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Secret Manager Best Practices](https://cloud.google.com/secret-manager/docs/best-practices)

## 🎯 Next Steps

1. ✅ Setup complete
2. 🔄 Push code → Auto deploy
3. 📊 Monitor performance
4. 🔧 Customize as needed
5. 🌐 Add custom domain (optional)

---

**Need help?** Check the [troubleshooting section](#-troubleshooting) or open an issue on GitHub.
