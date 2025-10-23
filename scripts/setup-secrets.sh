#!/bin/bash

# Quick Setup Script for Cloud Run Secrets
# Run this script to create all required secrets in Google Cloud Secret Manager
# Usage: ./scripts/setup-secrets.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
GRAY='\033[0;90m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up Google Cloud Secrets...${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}Error: gcloud CLI is not installed${NC}"
    exit 1
fi

# Prompt for secrets
echo -e "\n${YELLOW}Please provide the following values:${NC}"
echo -e "${GRAY}(Press Enter to skip optional secrets)${NC}"

# MongoDB URI
echo -ne "\n${CYAN}MongoDB Connection URI (required): ${NC}"
read MONGODB_URI
if [ -z "$MONGODB_URI" ]; then
    echo -e "${RED}Error: MongoDB URI is required${NC}"
    exit 1
fi

# JWT Secrets
echo -ne "${CYAN}JWT Secret (required, min 32 chars recommended): ${NC}"
read JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}Error: JWT Secret is required${NC}"
    exit 1
fi

echo -ne "${CYAN}JWT Refresh Secret (required, min 32 chars recommended): ${NC}"
read JWT_REFRESH_SECRET
if [ -z "$JWT_REFRESH_SECRET" ]; then
    echo -e "${RED}Error: JWT Refresh Secret is required${NC}"
    exit 1
fi

# Redis URL (optional)
echo -ne "${CYAN}Redis URL (optional, e.g., redis://host:6379): ${NC}"
read REDIS_URL
if [ -z "$REDIS_URL" ]; then
    REDIS_URL="redis://localhost:6379"
    echo -e "${GRAY}Using default: $REDIS_URL${NC}"
fi

# SendGrid (optional)
echo -ne "${CYAN}SendGrid API Key (optional): ${NC}"
read SENDGRID_API_KEY
if [ -z "$SENDGRID_API_KEY" ]; then
    SENDGRID_API_KEY="SG.dummy-key-email-disabled"
    echo -e "${GRAY}Email sending will be disabled${NC}"
fi

echo -ne "${CYAN}From Email Address (optional): ${NC}"
read FROM_EMAIL
if [ -z "$FROM_EMAIL" ]; then
    FROM_EMAIL="noreply@example.com"
    echo -e "${GRAY}Using default: $FROM_EMAIL${NC}"
fi

echo -e "\n${GREEN}Creating secrets...${NC}"

# Function to create or update secret
create_secret() {
    local NAME=$1
    local VALUE=$2

    if gcloud secrets describe $NAME &>/dev/null; then
        echo -e "  ${YELLOW}Updating secret: $NAME${NC}"
        echo -n "$VALUE" | gcloud secrets versions add $NAME --data-file=-
    else
        echo -e "  ${CYAN}Creating secret: $NAME${NC}"
        echo -n "$VALUE" | gcloud secrets create $NAME --data-file=-
    fi
    echo -e "  ${GREEN}✓ $NAME created/updated${NC}"
}

# Create all secrets
create_secret "MONGODB_URI" "$MONGODB_URI"
create_secret "JWT_SECRET" "$JWT_SECRET"
create_secret "JWT_REFRESH_SECRET" "$JWT_REFRESH_SECRET"
create_secret "REDIS_URL" "$REDIS_URL"
create_secret "SENDGRID_API_KEY" "$SENDGRID_API_KEY"
create_secret "FROM_EMAIL" "$FROM_EMAIL"

# Grant access to Cloud Run service account
echo -e "\n${GREEN}Granting access to Cloud Run service account...${NC}"

PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format="value(projectNumber)")

SECRETS=("MONGODB_URI" "JWT_SECRET" "JWT_REFRESH_SECRET" "REDIS_URL" "SENDGRID_API_KEY" "FROM_EMAIL")

for secret in "${SECRETS[@]}"; do
    echo -e "  ${CYAN}Granting access to: $secret${NC}"
    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet 2>/dev/null || true

    gcloud secrets add-iam-policy-binding $secret \
        --member="serviceAccount:${PROJECT_NUMBER}@cloudbuild.gserviceaccount.com" \
        --role="roles/secretmanager.secretAccessor" \
        --quiet 2>/dev/null || true
done

echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}Secrets setup completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "\n${YELLOW}Next steps:${NC}"
echo -e "1. Run: ${NC}./scripts/deploy-cloudrun.sh"
echo -e "2. Or use: ${NC}gcloud builds submit --config cloudbuild.yaml"
