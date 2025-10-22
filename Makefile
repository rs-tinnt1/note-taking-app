# ============================================
# NOTE TAKING APP - MAKEFILE
# ============================================

.PHONY: help dev start stop restart logs status clean build

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
BLUE := \033[0;34m
NC := \033[0m # No Color

# Configuration
CONTAINER_RUNTIME ?= docker
COMPOSE_CMD := $(if $(filter podman,$(CONTAINER_RUNTIME)),podman-compose,docker-compose)

help: ## Show this help message
	@echo "$(GREEN)Note Taking App - Available Commands:$(NC)"
	@echo ""
	@echo "$(BLUE)Usage: make [command] CONTAINER_RUNTIME=[docker|podman]$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

dev: ## Start development environment
	@echo "$(GREEN)Starting development environment with $(CONTAINER_RUNTIME)...$(NC)"
	$(COMPOSE_CMD) up -d
	@echo "$(GREEN)Development environment started!$(NC)"
	@echo "  - Application: http://localhost:8080"
	@echo "  - API Docs: http://localhost:8080/api-docs"
	@echo "  - Health: http://localhost:8080/health"

start: ## Start services
	@echo "$(GREEN)Starting services...$(NC)"
	$(COMPOSE_CMD) up -d
	@echo "$(GREEN)Services started!$(NC)"

stop: ## Stop services
	@echo "$(GREEN)Stopping services...$(NC)"
	$(COMPOSE_CMD) down
	@echo "$(GREEN)Services stopped!$(NC)"

restart: ## Restart services
	@echo "$(GREEN)Restarting services...$(NC)"
	$(COMPOSE_CMD) restart
	@echo "$(GREEN)Services restarted!$(NC)"

build: ## Build container images
	@echo "$(GREEN)Building container images with $(CONTAINER_RUNTIME)...$(NC)"
	$(COMPOSE_CMD) build

logs: ## View logs
	@echo "$(GREEN)Viewing logs...$(NC)"
	$(COMPOSE_CMD) logs -f

logs-app: ## View application logs
	@echo "$(GREEN)Viewing application logs...$(NC)"
	$(COMPOSE_CMD) logs -f app

logs-db: ## View database logs
	@echo "$(GREEN)Viewing database logs...$(NC)"
	$(COMPOSE_CMD) logs -f mongodb

status: ## Show service status
	@echo "$(GREEN)Service Status:$(NC)"
	$(COMPOSE_CMD) ps

health: ## Check application health
	@echo "$(GREEN)Checking application health...$(NC)"
	@curl -f http://localhost:8080/health || echo "$(RED)Health check failed!$(NC)"

shell: ## Open shell in application container
	@echo "$(GREEN)Opening shell in application container...$(NC)"
	$(COMPOSE_CMD) exec app /bin/sh

db-shell: ## Open MongoDB shell
	@echo "$(GREEN)Opening MongoDB shell...$(NC)"
	$(COMPOSE_CMD) exec mongodb mongosh

clean: ## Clean up containers and volumes
	@echo "$(GREEN)Cleaning up...$(NC)"
	$(COMPOSE_CMD) down -v --remove-orphans
	$(CONTAINER_RUNTIME) system prune -f
	@echo "$(GREEN)Cleanup completed!$(NC)"

setup: ## Initial setup
	@echo "$(GREEN)Setting up project...$(NC)"
	@if [ ! -f .env ]; then \
		echo "$(YELLOW)Creating .env file from template...$(NC)"; \
		cp env.example .env; \
		echo "$(YELLOW)Please edit .env file with your configuration.$(NC)"; \
	fi
	@echo "$(GREEN)Setup completed!$(NC)"

# Docker specific commands
docker: ## Run with Docker
	@$(MAKE) dev CONTAINER_RUNTIME=docker

# Podman specific commands  
podman: ## Run with Podman
	@$(MAKE) dev CONTAINER_RUNTIME=podman