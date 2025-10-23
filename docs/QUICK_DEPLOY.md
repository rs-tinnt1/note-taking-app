# 🚀 Quick Deployment Guide - GitHub to Cloud Run

## ✅ Pre-Deployment Checklist

Bạn đã hoàn thành setup! Hãy kiểm tra lại:

### 1. **Local Files** ✓

- [x] `.env` file đã tạo (local only, không commit)
- [x] Source code đã sẵn sàng
- [x] Dependencies đã cài đặt (`npm install`)

### 2. **Google Cloud Setup** (Cần làm 1 lần)

```powershell
# A. Enable APIs
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable containerregistry.googleapis.com

# B. Create secrets
.\scripts\setup-secrets.ps1

# C. Create service account for GitHub
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions"

# D. Grant roles
$PROJECT_ID = "your-project-id"
$SA_EMAIL = "github-actions@${PROJECT_ID}.iam.gserviceaccount.com"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SA_EMAIL}" `
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SA_EMAIL}" `
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID `
    --member="serviceAccount:${SA_EMAIL}" `
    --role="roles/storage.admin"

# E. Create and download key
gcloud iam service-accounts keys create github-actions-key.json `
    --iam-account=$SA_EMAIL
```

### 3. **GitHub Secrets Setup** (Cần làm 1 lần)

Đi tới: **GitHub Repository → Settings → Secrets and variables → Actions**

Thêm 3 secrets sau:

| Secret Name      | Value                                           | Where to get                      |
| ---------------- | ----------------------------------------------- | --------------------------------- |
| `GCP_SA_KEY`     | Toàn bộ nội dung file `github-actions-key.json` | Copy từ file vừa tạo              |
| `GCP_PROJECT_ID` | Your GCP project ID                             | `gcloud config get-value project` |
| `GCP_REGION`     | `asia-southeast1`                               | Hoặc region bạn chọn              |

**Copy file key:**

```powershell
# PowerShell
Get-Content github-actions-key.json | Set-Clipboard
# Sau đó paste vào GitHub Secret
```

## 🎯 Deploy Process

### Option 1: Auto Deploy (Recommended)

```bash
# 1. Commit code
git add .
git commit -m "feat: ready for Cloud Run deployment"

# 2. Push to GitHub
git push origin master

# 3. Done!
# GitHub Actions sẽ tự động:
# - Run tests
# - Build Docker image
# - Push to Container Registry
# - Deploy to Cloud Run
```

**Monitor deployment:**

- Go to: `https://github.com/YOUR_USERNAME/note-taking-app/actions`
- Click on latest workflow run
- Watch the progress

### Option 2: Manual Deploy (Backup)

```powershell
# If GitHub Actions fails, use this
.\scripts\deploy-cloudrun.ps1
```

## 📊 Post-Deployment

### Get Service URL

```bash
gcloud run services describe note-taking-api `
    --region=asia-southeast1 `
    --format='value(status.url)'
```

### Test Endpoints

```powershell
# Health check
curl https://your-service-url/health

# API docs
# Open in browser: https://your-service-url/api-docs

# Test registration
curl -X POST https://your-service-url/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

### View Logs

```bash
# Real-time logs
gcloud run services logs tail note-taking-api --region=asia-southeast1

# Recent logs
gcloud run services logs read note-taking-api --region=asia-southeast1 --limit=50
```

## 🔧 Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**

1. Go to Actions tab
2. Click on failed workflow
3. Expand failed step
4. Read error message

**Common issues:**

#### 1. "Permission denied"

- Check service account has all roles
- Verify GitHub secret `GCP_SA_KEY` is complete JSON

#### 2. "Secret not found"

```bash
# List all secrets
gcloud secrets list

# Recreate missing secrets
.\scripts\setup-secrets.ps1
```

#### 3. "Image not found"

```bash
# Check Container Registry
gcloud container images list

# Manually build and push
docker build -t gcr.io/PROJECT_ID/note-taking-app:test .
docker push gcr.io/PROJECT_ID/note-taking-app:test
```

#### 4. "Service won't start"

```bash
# Check Cloud Run logs
gcloud run services logs read note-taking-api --region=asia-southeast1

# Common causes:
# - Wrong MongoDB URI
# - Missing secrets
# - Port mismatch (should be 8080)
```

### App Issues

#### Database connection fails

- Check MongoDB Atlas IP whitelist: `0.0.0.0/0` (allow all) or Cloud Run IPs
- Verify `MONGODB_URI` secret is correct
- Test connection string locally first

#### Redis connection fails

- Set `REDIS_ENABLED=false` if not using Redis
- Or setup Cloud Memorystore
- Check VPC connector if using private Redis

#### CORS errors

- Update `CORS_ORIGIN` environment variable
- Current setting: `*` (allows all)
- For production: Set specific domains

## 🎨 Customization

### Update Environment Variables

**Via GitHub Actions** (in `.github/workflows/deploy-cloudrun.yml`):

```yaml
--set-env-vars NODE_ENV=production,PORT=8080,CORS_ORIGIN=https://yourdomain.com
```

**Via gcloud CLI:**

```bash
gcloud run services update note-taking-api `
    --region=asia-southeast1 `
    --update-env-vars CORS_ORIGIN=https://yourdomain.com
```

### Update Secrets

```bash
# Update secret value
echo -n "new-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Redeploy to use new secret
gcloud run services update note-taking-api --region=asia-southeast1
```

### Scale Configuration

```bash
# Update scaling
gcloud run services update note-taking-api `
    --region=asia-southeast1 `
    --min-instances=1 `
    --max-instances=20 `
    --memory=1Gi `
    --cpu=2
```

### Custom Domain

```bash
# Map domain
gcloud run domain-mappings create `
    --service note-taking-api `
    --domain api.yourdomain.com `
    --region asia-southeast1

# Get DNS records
gcloud run domain-mappings describe `
    --domain api.yourdomain.com `
    --region asia-southeast1
```

## 📈 Monitoring

### Cloud Run Dashboard

```bash
# Open Cloud Run console
gcloud run services describe note-taking-api `
    --region=asia-southeast1 `
    --format=yaml

# Or visit: https://console.cloud.google.com/run
```

### Metrics

- Request count
- Response time (latency)
- Error rate
- Container instances

### Alerts (Optional)

```bash
# Create alert for high error rate
# Via Cloud Console: Monitoring → Alerting
```

## 💰 Cost Optimization

**Current Configuration:**

- Min instances: 0 (no idle cost)
- Max instances: 10
- Memory: 512Mi
- CPU: 1
- CPU throttling: Enabled

**Estimated Cost:**

- ~$0 for low traffic (free tier)
- ~$5-10/month for moderate traffic
- Only pay for actual usage

**Reduce costs:**

```bash
# Keep CPU throttling on
--cpu-throttling

# Use minimum memory/CPU
--memory=512Mi --cpu=1

# Set aggressive timeout
--timeout=60
```

## 🎯 Next Steps

1. ✅ **Deploy successful**
2. 📱 **Test all endpoints**
3. 🔐 **Review security settings**
4. 📊 **Setup monitoring alerts**
5. 🌐 **Add custom domain** (optional)
6. 💾 **Setup backup strategy** for MongoDB
7. 📈 **Load testing** with expected traffic

## 📚 Documentation

- [GitHub Actions Workflow](.github/workflows/deploy-cloudrun.yml)
- [Deployment Guide](docs/GITHUB_CLOUDRUN_DEPLOYMENT.md)
- [Dockerfile Optimization](docs/DOCKERFILE_OPTIMIZATION.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## 🆘 Need Help?

**Check logs first:**

```bash
# GitHub Actions logs
https://github.com/YOUR_USERNAME/note-taking-app/actions

# Cloud Run logs
gcloud run services logs read note-taking-api --region=asia-southeast1
```

**Validation:**

```bash
npm run validate:deploy
```

**Manual deployment:**

```bash
.\scripts\deploy-cloudrun.ps1
```

---

**🎉 Congratulations!** Your app is now running on Google Cloud Run with automatic CI/CD!
