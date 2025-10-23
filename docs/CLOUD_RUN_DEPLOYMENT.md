# Google Cloud Deployment Guide

## Prerequisites

1. **Google Cloud Account**
   - Active GCP project
   - Billing enabled

2. **Install Google Cloud SDK**
   ```bash
   # Windows (PowerShell)
   (New-Object Net.WebClient).DownloadFile("https://dl.google.com/dl/cloudsdk/channels/rapid/GoogleCloudSDKInstaller.exe", "$env:Temp\GoogleCloudSDKInstaller.exe")
   & $env:Temp\GoogleCloudSDKInstaller.exe
   ```

3. **Authenticate**
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

## Setup Steps

### 1. Enable Required APIs

```bash
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable vpcaccess.googleapis.com
```

### 2. Create Secrets in Secret Manager

```bash
# MongoDB URI
echo -n "mongodb+srv://username:password@cluster.mongodb.net/note-taking-app?retryWrites=true&w=majority" | gcloud secrets create MONGODB_URI --data-file=-

# JWT Secret
echo -n "your-super-secret-jwt-key-change-this" | gcloud secrets create JWT_SECRET --data-file=-

# JWT Refresh Secret
echo -n "your-super-secret-refresh-key-change-this" | gcloud secrets create JWT_REFRESH_SECRET --data-file=-

# Redis URL (optional if using Cloud Memorystore)
echo -n "redis://10.0.0.3:6379" | gcloud secrets create REDIS_URL --data-file=-

# SendGrid API Key (optional)
echo -n "SG.your-sendgrid-api-key" | gcloud secrets create SENDGRID_API_KEY --data-file=-

# From Email
echo -n "noreply@yourdomain.com" | gcloud secrets create FROM_EMAIL --data-file=-
```

### 3. Grant Secret Access to Cloud Build & Cloud Run

```bash
# Get project number
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")

# Grant Cloud Build service account access to secrets
gcloud secrets add-iam-policy-binding MONGODB_URI --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding JWT_SECRET --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding JWT_REFRESH_SECRET --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding REDIS_URL --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding SENDGRID_API_KEY --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding FROM_EMAIL --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"

# Grant Cloud Run service account access to secrets
gcloud secrets add-iam-policy-binding MONGODB_URI --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding JWT_SECRET --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding JWT_REFRESH_SECRET --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding REDIS_URL --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding SENDGRID_API_KEY --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
gcloud secrets add-iam-policy-binding FROM_EMAIL --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

### 4. Setup MongoDB (Choose one option)

**Option A: MongoDB Atlas (Recommended)**
1. Create cluster at https://cloud.mongodb.com
2. Add your Cloud Run IP ranges to whitelist (or use 0.0.0.0/0 for simplicity)
3. Create database user
4. Get connection string and save to Secret Manager

**Option B: Cloud Memorystore for MongoDB**
```bash
# Contact Google Cloud sales for MongoDB managed service
```

### 5. Setup Redis (Optional)

```bash
# Create Redis instance in Cloud Memorystore
gcloud redis instances create note-cache \
    --size=1 \
    --region=asia-southeast1 \
    --redis-version=redis_6_x \
    --tier=basic

# Get Redis host
gcloud redis instances describe note-cache --region=asia-southeast1 --format="value(host)"
```

### 6. Deploy Using Cloud Build

**Manual Deploy:**
```bash
gcloud builds submit --config cloudbuild.yaml --substitutions=_REGION=asia-southeast1
```

**Setup CI/CD Trigger:**
```bash
# Connect to GitHub repository
gcloud builds triggers create github \
    --repo-name=note-taking-app \
    --repo-owner=YOUR_GITHUB_USERNAME \
    --branch-pattern="^master$" \
    --build-config=cloudbuild.yaml \
    --substitutions=_REGION=asia-southeast1
```

### 7. Configure Custom Domain (Optional)

```bash
# Map custom domain
gcloud run domain-mappings create \
    --service note-taking-api \
    --domain api.yourdomain.com \
    --region asia-southeast1

# Get DNS records to configure
gcloud run domain-mappings describe \
    --domain api.yourdomain.com \
    --region asia-southeast1
```

### 8. Setup VPC Connector (If using Cloud Memorystore)

```bash
# Create VPC connector
gcloud compute networks vpc-access connectors create note-connector \
    --region=asia-southeast1 \
    --subnet-project=YOUR_PROJECT_ID \
    --subnet=default \
    --min-throughput=200 \
    --max-throughput=300

# Update Cloud Run to use VPC connector
gcloud run services update note-taking-api \
    --vpc-connector note-connector \
    --region asia-southeast1
```

## Verify Deployment

```bash
# Get service URL
SERVICE_URL=$(gcloud run services describe note-taking-api --region=asia-southeast1 --format="value(status.url)")

# Test health endpoint
curl $SERVICE_URL/health

# Test API
curl $SERVICE_URL/api-docs
```

## Monitoring & Logs

```bash
# View logs
gcloud run services logs read note-taking-api --region=asia-southeast1 --limit=50

# Stream logs
gcloud run services logs tail note-taking-api --region=asia-southeast1
```

## Update Secrets

```bash
# Update a secret
echo -n "new-secret-value" | gcloud secrets versions add SECRET_NAME --data-file=-

# Redeploy service to pick up new secrets
gcloud run services update note-taking-api --region=asia-southeast1
```

## Rollback

```bash
# List revisions
gcloud run revisions list --service=note-taking-api --region=asia-southeast1

# Route traffic to previous revision
gcloud run services update-traffic note-taking-api \
    --to-revisions=REVISION_NAME=100 \
    --region=asia-southeast1
```

## Cost Optimization

1. **Set Min Instances to 0** (already configured)
2. **Use appropriate CPU/Memory** (512Mi/1CPU for starter)
3. **Enable Request Timeout** (5 min max)
4. **Use Cloud Scheduler** to keep warm if needed

## Troubleshooting

### Service won't start
```bash
# Check logs for errors
gcloud run services logs read note-taking-api --region=asia-southeast1 --limit=100

# Verify secrets are accessible
gcloud run services describe note-taking-api --region=asia-southeast1 --format=yaml
```

### Database connection fails
- Check MongoDB Atlas IP whitelist includes Cloud Run IPs
- Verify connection string in secrets
- Check VPC connector if using Cloud Memorystore

### High latency
- Consider setting min-instances > 0 to avoid cold starts
- Use Cloud CDN for static assets
- Enable connection pooling in MongoDB

## Security Best Practices

1. **Use Secret Manager** for all sensitive data ✓
2. **Enable HTTPS only** (Cloud Run does this automatically) ✓
3. **Use IAM** to restrict who can deploy
4. **Enable Cloud Armor** for DDoS protection
5. **Use VPC** for private resources
6. **Regular security audits** using Cloud Security Command Center

## Additional Resources

- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Cloud Build Documentation](https://cloud.google.com/build/docs)
- [Secret Manager Documentation](https://cloud.google.com/secret-manager/docs)
