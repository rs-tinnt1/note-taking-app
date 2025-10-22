# Note Taking App - Makefile
# Simplified commands for development and deployment

.PHONY: help install dev test build clean docker podman k8s

# Default target
help:
	@echo "Note Taking App - Available Commands"
	@echo "====================================="
	@echo ""
	@echo "Development:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Start development server"
	@echo "  make test        - Run tests"
	@echo "  make lint        - Run linter"
	@echo "  make format      - Format code"
	@echo ""
	@echo "Docker:"
	@echo "  make docker      - Deploy with Docker Compose"
	@echo "  make docker-stop - Stop Docker services"
	@echo "  make docker-logs - View Docker logs"
	@echo ""
	@echo "Podman:"
	@echo "  make podman      - Deploy with Podman"
	@echo "  make podman-stop - Stop Podman services"
	@echo "  make podman-logs - View Podman logs"
	@echo ""
	@echo "Kubernetes:"
	@echo "  make k8s         - Deploy to Minikube"
	@echo "  make k8s-kind    - Deploy to Kind"
	@echo "  make k8s-stop    - Stop Kubernetes deployment"
	@echo "  make k8s-logs    - View Kubernetes logs"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean       - Clean up resources"
	@echo "  make status      - Show deployment status"

# Development commands
install:
	@echo "Installing dependencies..."
	npm install

dev:
	@echo "Starting development server..."
	npm run dev

test:
	@echo "Running tests..."
	npm test

lint:
	@echo "Running linter..."
	npm run lint

format:
	@echo "Formatting code..."
	npm run format:lint

# Docker commands
docker:
	@echo "Deploying with Docker Compose..."
	@if [ ! -f .env ]; then cp env.example .env; fi
	docker-compose up -d
	@echo "App available at: http://localhost:3000"

docker-stop:
	@echo "Stopping Docker services..."
	docker-compose down

docker-logs:
	@echo "Viewing Docker logs..."
	docker-compose logs -f

# Podman commands
podman:
	@echo "Deploying with Podman..."
	@if command -v podman-compose >/dev/null 2>&1; then \
		podman-compose up -d; \
	else \
		echo "Using manual Podman deployment..."; \
		./scripts/deploy-local.sh podman deploy; \
	fi
	@echo "App available at: http://localhost:3000"

podman-stop:
	@echo "Stopping Podman services..."
	@if command -v podman-compose >/dev/null 2>&1; then \
		podman-compose down; \
	else \
		./scripts/deploy-local.sh podman cleanup; \
	fi

podman-logs:
	@echo "Viewing Podman logs..."
	@if command -v podman-compose >/dev/null 2>&1; then \
		podman-compose logs -f; \
	else \
		podman logs -f note-taking-app; \
	fi

# Kubernetes commands
k8s:
	@echo "Deploying to Minikube..."
	@if ! minikube status >/dev/null 2>&1; then \
		echo "Starting Minikube..."; \
		minikube start; \
	fi
	./scripts/deploy-local.sh k8s deploy minikube

k8s-kind:
	@echo "Deploying to Kind..."
	@if ! kind get clusters | grep -q note-app; then \
		echo "Creating Kind cluster..."; \
		kind create cluster --name note-app; \
	fi
	./scripts/deploy-local.sh k8s deploy kind

k8s-stop:
	@echo "Stopping Kubernetes deployment..."
	./scripts/deploy-local.sh k8s cleanup

k8s-logs:
	@echo "Viewing Kubernetes logs..."
	kubectl logs -f deployment/note-app -n note-taking-app

# Utility commands
clean:
	@echo "Cleaning up resources..."
	@echo "Docker cleanup..."
	@docker-compose down 2>/dev/null || true
	@docker rmi note-taking-app:latest 2>/dev/null || true
	@echo "Podman cleanup..."
	@podman-compose down 2>/dev/null || true
	@podman rmi note-taking-app:latest 2>/dev/null || true
	@echo "Kubernetes cleanup..."
	@kubectl delete -k k8s/ 2>/dev/null || true
	@echo "Cleanup completed"

status:
	@echo "Checking deployment status..."
	@echo ""
	@echo "Docker Compose:"
	@docker-compose ps 2>/dev/null || echo "Not running"
	@echo ""
	@echo "Podman:"
	@podman ps --filter name=note-taking-app 2>/dev/null || echo "Not running"
	@echo ""
	@echo "Kubernetes:"
	@kubectl get all -n note-taking-app 2>/dev/null || echo "Not deployed"

# Build commands
build:
	@echo "Building application..."
	npm run build

build-docker:
	@echo "Building Docker image..."
	docker build -f Dockerfile.k8s -t note-taking-app:latest .

build-podman:
	@echo "Building Podman image..."
	podman build -f Dockerfile.k8s -t note-taking-app:latest .

# Quick start commands
quick-docker:
	@echo "Quick start with Docker..."
	make install
	make docker
	@echo "App is running at http://localhost:3000"

quick-podman:
	@echo "Quick start with Podman..."
	make install
	make podman
	@echo "App is running at http://localhost:3000"

quick-k8s:
	@echo "Quick start with Kubernetes..."
	make install
	make k8s
	@echo "App is running (check kubectl get svc -n note-taking-app)"
