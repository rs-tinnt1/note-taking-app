# 🏗️ Infrastructure - Note Taking App

Minimal infrastructure setup for the Note Taking App Backend with Docker/Podman support.

## 🚀 Quick Start

### Prerequisites
- **Docker** >= 20.10.0 or **Podman** >= 5.0.0
- **Make** (optional, for convenience commands)

### Setup
```bash
# Copy environment file
cp env.example .env

# Edit configuration
nano .env

# Start with Docker
make dev CONTAINER_RUNTIME=docker
# or
make docker

# Start with Podman  
make dev CONTAINER_RUNTIME=podman
# or
make podman
```

### Direct Commands
```bash
# Docker
docker-compose up -d

# Podman
podman-compose up -d
```

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `make dev` | Start development environment |
| `make start` | Start services |
| `make stop` | Stop services |
| `make restart` | Restart services |
| `make build` | Build container images |
| `make logs` | View all logs |
| `make logs-app` | View application logs |
| `make status` | Show service status |
| `make health` | Check application health |
| `make clean` | Clean up containers and volumes |
| `make shell` | Open app container shell |
| `make db-shell` | Open MongoDB shell |

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| **App** | 8080 | Node.js application |
| **Nginx** | 80 | Reverse proxy |
| **MongoDB** | 27017 | Database |
| **Redis** | 6379 | Cache |

## 🔧 Configuration

### Environment Variables
Copy `env.example` to `.env` and configure:

```env
NODE_ENV=development
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=password
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CORS_ORIGIN=http://localhost:3000
```

### Container Runtime
- **Docker**: Uses `docker-compose`
- **Podman**: Uses `podman-compose`
- **Auto-detect**: Set `CONTAINER_RUNTIME` environment variable

## 🌐 Access Points

- **Application**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health

## 🆘 Troubleshooting

### Common Issues
1. **Port conflicts**: Check `lsof -i :8080`
2. **Permission errors**: Run `chmod +x` on scripts
3. **Container not starting**: Check logs with `make logs`

### Debug Commands
```bash
make logs-app    # View app logs
make status      # Check service status
make health      # Test application health
```

---

**Last Updated**: $(date)  
**Version**: 1.0.0