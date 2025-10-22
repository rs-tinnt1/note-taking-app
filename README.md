# 📝 Note Taking App

A full-stack note-taking application with JWT authentication, built with Node.js/Express backend and containerized infrastructure.

## 🚀 Quick Start

### Prerequisites
- **Node.js** >= 18.0.0
- **Podman** >= 5.0.0 (or Docker)
- **MongoDB** >= 7.0

### Setup
```bash
# Copy environment file
cp env.example .env

# Edit configuration
nano .env

# Start with Docker
make dev CONTAINER_RUNTIME=docker

# Start with Podman  
make dev CONTAINER_RUNTIME=podman
```

### Direct Commands
```bash
# Docker
docker-compose up -d

# Podman
podman-compose up -d
```

## 📊 Services

| Service | Port | Description |
|---------|------|-------------|
| **App** | 3000 | Node.js application (direct) |
| **Nginx** | 8080 | Reverse proxy |
| **MongoDB** | 27017 | Database |
| **Redis** | 6379 | Cache |

## 🌐 Access Points

- **Application**: http://localhost:8080
- **API Documentation**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health
- **Direct App**: http://localhost:3000/health

## 📚 Documentation

- **[Backend Guide](docs/BACKEND.md)** - Application code, API, and development
- **[Infrastructure Guide](docs/INFRASTRUCTURE.md)** - Deployment, Docker, and infrastructure
- **[API Documentation](http://localhost:8080/api-docs)** - Interactive API docs

## 🛠️ Technology Stack

- **Backend**: Node.js + Express.js + MongoDB
- **Authentication**: JWT (Access + Refresh tokens)
- **Containerization**: Podman/Docker
- **Reverse Proxy**: Nginx
- **Cache**: Redis
- **CI/CD**: GitHub Actions

## 🔧 Features

- **JWT Authentication** with token rotation
- **User Management** with password encryption
- **Note Management** with user ownership
- **Logical Deletion** for data recovery
- **File Upload** support
- **Email Notifications** via SendGrid
- **Health Monitoring** endpoints
- **API Documentation** with Swagger
- **Comprehensive Testing** (unit + integration)

## 🚨 Troubleshooting

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

**Version**: 1.0.0  
**Last Updated**: $(date)