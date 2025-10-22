#!/bin/bash

# Local Deployment Script for Note Taking App
# Supports Docker, Podman, and Kubernetes

set -e

# Configuration
APP_NAME="note-taking-app"
IMAGE_TAG="latest"
NAMESPACE="note-taking-app"
K8S_DIR="k8s"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

    case "$1" in
        "docker")
            if ! command -v docker &> /dev/null; then
                log_error "Docker is not installed"
                exit 1
            fi
            if ! command -v docker-compose &> /dev/null; then
                log_error "Docker Compose is not installed"
                exit 1
            fi
            ;;
        "podman")
            if ! command -v podman &> /dev/null; then
                log_error "Podman is not installed"
                exit 1
            fi
            ;;
        "k8s")
            if ! command -v kubectl &> /dev/null; then
                log_error "kubectl is not installed"
                exit 1
            fi
            if ! command -v docker &> /dev/null && ! command -v podman &> /dev/null; then
                log_error "Docker or Podman is required for building images"
                exit 1
            fi
            ;;
    esac

    log_success "Prerequisites check passed"
}

# Build Docker image
build_image() {
    local builder=${1:-docker}
    log_info "Building image using $builder..."

    if [ "$builder" = "podman" ]; then
        podman build -f Dockerfile.k8s -t ${APP_NAME}:${IMAGE_TAG} .
    else
        docker build -f Dockerfile.k8s -t ${APP_NAME}:${IMAGE_TAG} .
    fi

    log_success "Image built successfully"
}

# Docker deployment
deploy_docker() {
    log_info "Deploying with Docker Compose..."

    # Check if .env exists
    if [ ! -f .env ]; then
        log_warning ".env file not found, creating from env.example"
        cp env.example .env
    fi

    # Start services
    docker-compose up -d

    log_success "Docker deployment completed"
    log_info "Access the app at: http://localhost:3000"
    log_info "API Docs: http://localhost:3000/api-docs"
    log_info "Health Check: http://localhost:3000/health"
}

# Podman deployment
deploy_podman() {
    log_info "Deploying with Podman..."

    # Check if podman-compose is available
    if command -v podman-compose &> /dev/null; then
        log_info "Using podman-compose..."
        podman-compose up -d
    else
        log_info "Using manual Podman commands..."

        # Create network
        podman network create ${APP_NAME}-network 2>/dev/null || true

        # Start MongoDB
        podman run -d \
            --name mongodb \
            --network ${APP_NAME}-network \
            -e MONGO_INITDB_ROOT_USERNAME=admin \
            -e MONGO_INITDB_ROOT_PASSWORD=password \
            -e MONGO_INITDB_DATABASE=note-taking-app \
            -p 27017:27017 \
            docker.io/mongo:7.0

        # Start Redis
        podman run -d \
            --name redis \
            --network ${APP_NAME}-network \
            -p 6379:6379 \
            docker.io/redis:7-alpine

        # Build and start app
        build_image podman
        podman run -d \
            --name ${APP_NAME} \
            --network ${APP_NAME}-network \
            -p 3000:8080 \
            -e MONGODB_URI=mongodb://admin:password@mongodb:27017/note-taking-app?authSource=admin \
            -e REDIS_URL=redis://redis:6379 \
            -e JWT_SECRET=your-secret-key \
            -e JWT_REFRESH_SECRET=your-refresh-secret \
            ${APP_NAME}:${IMAGE_TAG}
    fi

    log_success "Podman deployment completed"
    log_info "Access the app at: http://localhost:3000"
}

# Kubernetes deployment
deploy_k8s() {
    local cluster=${1:-minikube}
    log_info "Deploying to Kubernetes ($cluster)..."

    # Check cluster
    if [ "$cluster" = "minikube" ]; then
        if ! minikube status &> /dev/null; then
            log_info "Starting minikube..."
            minikube start
        fi
        minikube addons enable ingress 2>/dev/null || true
    fi

    # Build and load image
    build_image
    if [ "$cluster" = "minikube" ]; then
        minikube image load ${APP_NAME}:${IMAGE_TAG}
    elif [ "$cluster" = "kind" ]; then
        kind load docker-image ${APP_NAME}:${IMAGE_TAG} --name ${APP_NAME}
    fi

    # Deploy to Kubernetes
    kubectl apply -k ${K8S_DIR}/

    # Wait for deployment
    log_info "Waiting for deployment to be ready..."
    kubectl wait --for=condition=available --timeout=300s deployment/note-app -n ${NAMESPACE}

    log_success "Kubernetes deployment completed"

    # Show access info
    if [ "$cluster" = "minikube" ]; then
        log_info "Getting access URL..."
        minikube service note-app-service -n ${NAMESPACE} --url
    else
        log_info "Use port-forward to access:"
        log_info "kubectl port-forward svc/note-app-service 3000:80 -n ${NAMESPACE}"
    fi
}

# Show status
show_status() {
    case "$1" in
        "docker")
            log_info "Docker Status:"
            docker-compose ps
            ;;
        "podman")
            log_info "Podman Status:"
            podman ps --filter name=${APP_NAME}
            ;;
        "k8s")
            log_info "Kubernetes Status:"
            kubectl get all -n ${NAMESPACE}
            ;;
    esac
}

# Cleanup
cleanup() {
    case "$1" in
        "docker")
            log_info "Cleaning up Docker resources..."
            docker-compose down
            docker rmi ${APP_NAME}:${IMAGE_TAG} 2>/dev/null || true
            ;;
        "podman")
            log_info "Cleaning up Podman resources..."
            podman-compose down 2>/dev/null || true
            podman stop mongodb redis ${APP_NAME} 2>/dev/null || true
            podman rm mongodb redis ${APP_NAME} 2>/dev/null || true
            podman rmi ${APP_NAME}:${IMAGE_TAG} 2>/dev/null || true
            podman network rm ${APP_NAME}-network 2>/dev/null || true
            ;;
        "k8s")
            log_info "Cleaning up Kubernetes resources..."
            kubectl delete -k ${K8S_DIR}/ 2>/dev/null || true
            ;;
    esac
    log_success "Cleanup completed"
}

# Show help
show_help() {
    echo "Note Taking App - Local Deployment Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  docker [deploy|status|cleanup]  - Docker Compose deployment"
    echo "  podman [deploy|status|cleanup]  - Podman deployment"
    echo "  k8s [deploy|status|cleanup] [minikube|kind] - Kubernetes deployment"
    echo "  help                            - Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 docker deploy               - Deploy with Docker Compose"
    echo "  $0 podman deploy               - Deploy with Podman"
    echo "  $0 k8s deploy minikube         - Deploy to Minikube"
    echo "  $0 k8s deploy kind             - Deploy to Kind"
    echo "  $0 docker status               - Show Docker status"
    echo "  $0 k8s cleanup                 - Clean up Kubernetes resources"
}

# Main execution
main() {
    case "${1:-help}" in
        "docker")
            check_prerequisites docker
            case "${2:-deploy}" in
                "deploy") deploy_docker ;;
                "status") show_status docker ;;
                "cleanup") cleanup docker ;;
                *) log_error "Unknown Docker command: $2" ;;
            esac
            ;;
        "podman")
            check_prerequisites podman
            case "${2:-deploy}" in
                "deploy") deploy_podman ;;
                "status") show_status podman ;;
                "cleanup") cleanup podman ;;
                *) log_error "Unknown Podman command: $2" ;;
            esac
            ;;
        "k8s")
            check_prerequisites k8s
            case "${2:-deploy}" in
                "deploy") deploy_k8s "${3:-minikube}" ;;
                "status") show_status k8s ;;
                "cleanup") cleanup k8s ;;
                *) log_error "Unknown Kubernetes command: $2" ;;
            esac
            ;;
        "help"|"-h"|"--help")
            show_help
            ;;
        *)
            log_error "Unknown command: $1"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
