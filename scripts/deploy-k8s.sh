#!/bin/bash

# Kubernetes Deployment Script for Note Taking App
# This script builds the Docker image and deploys to Kubernetes

set -e

# Configuration
IMAGE_NAME="note-taking-app"
IMAGE_TAG="latest"
REGISTRY="your-registry.com"  # Change this to your registry
NAMESPACE="note-taking-app"
K8S_DIR="k8s"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check if kubectl is installed
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl is not installed or not in PATH"
        exit 1
    fi

    # Check if docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed or not in PATH"
        exit 1
    fi

    # Check if kubectl can connect to cluster
    if ! kubectl cluster-info &> /dev/null; then
        log_error "Cannot connect to Kubernetes cluster"
        exit 1
    fi

    log_success "Prerequisites check passed"
}

# Build Docker image
build_image() {
    log_info "Building Docker image..."

    # Use the Kubernetes-specific Dockerfile
    docker build -f Dockerfile.k8s -t ${IMAGE_NAME}:${IMAGE_TAG} .

    if [ $? -eq 0 ]; then
        log_success "Docker image built successfully"
    else
        log_error "Failed to build Docker image"
        exit 1
    fi
}

# Tag and push image
push_image() {
    if [ "$REGISTRY" != "your-registry.com" ]; then
        log_info "Tagging and pushing image to registry..."

        # Tag image for registry
        docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}

        # Push to registry
        docker push ${REGISTRY}/${IMAGE_NAME}:${IMAGE_TAG}

        if [ $? -eq 0 ]; then
            log_success "Image pushed to registry successfully"
        else
            log_error "Failed to push image to registry"
            exit 1
        fi
    else
        log_warning "Registry not configured, skipping push"
        log_warning "Update REGISTRY variable in this script to push to your registry"
    fi
}

# Deploy to Kubernetes
deploy_k8s() {
    log_info "Deploying to Kubernetes..."

    # Check if namespace exists
    if ! kubectl get namespace ${NAMESPACE} &> /dev/null; then
        log_info "Creating namespace ${NAMESPACE}..."
        kubectl create namespace ${NAMESPACE}
    fi

    # Apply Kubernetes manifests
    log_info "Applying Kubernetes manifests..."
    kubectl apply -k ${K8S_DIR}/

    if [ $? -eq 0 ]; then
        log_success "Kubernetes manifests applied successfully"
    else
        log_error "Failed to apply Kubernetes manifests"
        exit 1
    fi
}

# Wait for deployment
wait_for_deployment() {
    log_info "Waiting for deployment to be ready..."

    # Wait for MongoDB
    log_info "Waiting for MongoDB to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/mongodb -n ${NAMESPACE}

    # Wait for Redis
    log_info "Waiting for Redis to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/redis -n ${NAMESPACE}

    # Wait for Note App
    log_info "Waiting for Note App to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/note-app -n ${NAMESPACE}

    log_success "All deployments are ready"
}

# Show deployment status
show_status() {
    log_info "Deployment Status:"
    echo ""

    # Show pods
    log_info "Pods:"
    kubectl get pods -n ${NAMESPACE}
    echo ""

    # Show services
    log_info "Services:"
    kubectl get svc -n ${NAMESPACE}
    echo ""

    # Show ingress
    log_info "Ingress:"
    kubectl get ingress -n ${NAMESPACE}
    echo ""

    # Show HPA
    log_info "Horizontal Pod Autoscaler:"
    kubectl get hpa -n ${NAMESPACE}
    echo ""
}

# Show access information
show_access_info() {
    log_info "Access Information:"
    echo ""

    # Get ingress IP
    INGRESS_IP=$(kubectl get ingress note-app-ingress -n ${NAMESPACE} -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null || echo "Pending")

    if [ "$INGRESS_IP" != "Pending" ] && [ "$INGRESS_IP" != "" ]; then
        log_success "Application is accessible at:"
        echo "  - http://note-app.local"
        echo "  - http://api.note-app.local"
        echo "  - API Docs: http://note-app.local/api-docs"
        echo "  - Health Check: http://note-app.local/health"
        echo ""
        log_warning "Add these entries to your /etc/hosts file:"
        echo "  ${INGRESS_IP} note-app.local"
        echo "  ${INGRESS_IP} api.note-app.local"
    else
        log_warning "Ingress IP is not available yet. Check with:"
        echo "  kubectl get ingress -n ${NAMESPACE}"
    fi
    echo ""
}

# Cleanup function
cleanup() {
    log_info "Cleaning up..."
    kubectl delete -k ${K8S_DIR}/ 2>/dev/null || true
    log_success "Cleanup completed"
}

# Main execution
main() {
    echo "=========================================="
    echo "  Note Taking App - Kubernetes Deployer"
    echo "=========================================="
    echo ""

    # Parse command line arguments
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            build_image
            push_image
            deploy_k8s
            wait_for_deployment
            show_status
            show_access_info
            ;;
        "status")
            show_status
            ;;
        "cleanup")
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [deploy|status|cleanup|help]"
            echo ""
            echo "Commands:"
            echo "  deploy  - Build image and deploy to Kubernetes (default)"
            echo "  status  - Show deployment status"
            echo "  cleanup - Remove all resources"
            echo "  help    - Show this help message"
            ;;
        *)
            log_error "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
