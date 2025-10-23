# Quick Setup Script for Cloud Run Secrets
# Run this script to create all required secrets in Google Cloud Secret Manager
# Usage: .\scripts\setup-secrets.ps1

$ErrorActionPreference = "Stop"

Write-Host "Setting up Google Cloud Secrets..." -ForegroundColor Green

# Check if gcloud is installed
try {
    $null = Get-Command gcloud -ErrorAction Stop
} catch {
    Write-Host "Error: gcloud CLI is not installed" -ForegroundColor Red
    exit 1
}

# Prompt for secrets
Write-Host "`nPlease provide the following values:" -ForegroundColor Yellow
Write-Host "(Press Enter to skip optional secrets)" -ForegroundColor Gray

# MongoDB URI
$MONGODB_URI = Read-Host "`nMongoDB Connection URI (required)"
if ([string]::IsNullOrEmpty($MONGODB_URI)) {
    Write-Host "Error: MongoDB URI is required" -ForegroundColor Red
    exit 1
}

# JWT Secrets
$JWT_SECRET = Read-Host "JWT Secret (required, min 32 chars recommended)"
if ([string]::IsNullOrEmpty($JWT_SECRET)) {
    Write-Host "Error: JWT Secret is required" -ForegroundColor Red
    exit 1
}

$JWT_REFRESH_SECRET = Read-Host "JWT Refresh Secret (required, min 32 chars recommended)"
if ([string]::IsNullOrEmpty($JWT_REFRESH_SECRET)) {
    Write-Host "Error: JWT Refresh Secret is required" -ForegroundColor Red
    exit 1
}

# Redis URL (optional)
$REDIS_URL = Read-Host "Redis URL (optional, e.g., redis://host:6379)"
if ([string]::IsNullOrEmpty($REDIS_URL)) {
    $REDIS_URL = "redis://localhost:6379"
    Write-Host "Using default: $REDIS_URL" -ForegroundColor Gray
}

# SendGrid (optional)
$SENDGRID_API_KEY = Read-Host "SendGrid API Key (optional)"
if ([string]::IsNullOrEmpty($SENDGRID_API_KEY)) {
    $SENDGRID_API_KEY = "SG.dummy-key-email-disabled"
    Write-Host "Email sending will be disabled" -ForegroundColor Gray
}

$FROM_EMAIL = Read-Host "From Email Address (optional)"
if ([string]::IsNullOrEmpty($FROM_EMAIL)) {
    $FROM_EMAIL = "noreply@example.com"
    Write-Host "Using default: $FROM_EMAIL" -ForegroundColor Gray
}

Write-Host "`nCreating secrets..." -ForegroundColor Green

# Function to create or update secret
function Set-Secret {
    param (
        [string]$Name,
        [string]$Value
    )

    try {
        # Check if secret exists
        $exists = gcloud secrets describe $Name 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  Updating secret: $Name" -ForegroundColor Yellow
            echo $Value | gcloud secrets versions add $Name --data-file=-
        } else {
            Write-Host "  Creating secret: $Name" -ForegroundColor Cyan
            echo $Value | gcloud secrets create $Name --data-file=-
        }
        Write-Host "  ✓ $Name created/updated" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Failed to create/update $Name" -ForegroundColor Red
        Write-Host "  Error: $_" -ForegroundColor Red
    }
}

# Create all secrets
Set-Secret -Name "MONGODB_URI" -Value $MONGODB_URI
Set-Secret -Name "JWT_SECRET" -Value $JWT_SECRET
Set-Secret -Name "JWT_REFRESH_SECRET" -Value $JWT_REFRESH_SECRET
Set-Secret -Name "REDIS_URL" -Value $REDIS_URL
Set-Secret -Name "SENDGRID_API_KEY" -Value $SENDGRID_API_KEY
Set-Secret -Name "FROM_EMAIL" -Value $FROM_EMAIL

# Grant access to Cloud Run service account
Write-Host "`nGranting access to Cloud Run service account..." -ForegroundColor Green

$PROJECT_ID = (gcloud config get-value project 2>$null)
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

$SECRETS = @("MONGODB_URI", "JWT_SECRET", "JWT_REFRESH_SECRET", "REDIS_URL", "SENDGRID_API_KEY", "FROM_EMAIL")

foreach ($secret in $SECRETS) {
    Write-Host "  Granting access to: $secret" -ForegroundColor Cyan
    gcloud secrets add-iam-policy-binding $secret `
        --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" `
        --role="roles/secretmanager.secretAccessor" `
        --quiet 2>$null

    gcloud secrets add-iam-policy-binding $secret `
        --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" `
        --role="roles/secretmanager.secretAccessor" `
        --quiet 2>$null
}

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "Secrets setup completed successfully!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Run: .\scripts\deploy-cloudrun.ps1" -ForegroundColor White
Write-Host "2. Or use: gcloud builds submit --config cloudbuild.yaml" -ForegroundColor White
