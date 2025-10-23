# 📝 Note Taking App

A modern note-taking application built with Node.js, Express, MongoDB, and Redis caching. Features user authentication, CRUD operations, and high-performance caching.

## ✨ Features

- **User Authentication**: JWT-based auth with refresh tokens
- **Note Management**: Create, read, update, delete notes
- **Search & Pagination**: Full-text search with pagination
- **Redis Caching**: High-performance caching layer
- **Graceful Degradation**: Works with or without Redis
- **Docker Support**: Containerized deployment
- **Kubernetes Ready**: Production-ready K8s manifests
- **API Documentation**: Swagger/OpenAPI docs

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Redis (optional)
- Docker (optional)

### Installation

```bash
# Clone repository
git clone <your-repo>
cd note-taking-app

# Install dependencies
npm install

# Copy environment file
cp env.example .env

# Start development server
npm run dev
```

### Using Docker (Recommended)

```bash
# Quick start with Docker
make quick-docker

# Or manually
docker-compose up -d
```

### Using Podman

```bash
# Quick start with Podman
make quick-podman

# Or manually
./scripts/deploy-local.sh podman deploy
```

### Using Kubernetes

```bash
# Quick start with Minikube
make quick-k8s

# Or manually
./scripts/deploy-local.sh k8s deploy minikube
```

## 📖 API Documentation

Once running, visit:
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Gateway   │    │   Note App      │
│   (Client)      │◄──►│   (Express)     │◄──►│   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   Redis Cache   │
                       │   (Optional)    │
                       └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MongoDB       │
                       │   (Database)    │
                       └─────────────────┘
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start dev server
npm run test         # Run tests
npm run lint         # Run linter
npm run format       # Format code

# Docker
make docker          # Deploy with Docker
make docker-stop     # Stop Docker services
make docker-logs     # View logs

# Podman
make podman          # Deploy with Podman
make podman-stop     # Stop Podman services
make podman-logs     # View logs

# Kubernetes
make k8s             # Deploy to Minikube
make k8s-kind        # Deploy to Kind
make k8s-stop        # Stop K8s deployment
make k8s-logs        # View logs

# Utilities
make clean           # Clean up resources
make status          # Show status
```

### Project Structure

```
note-taking-app/
├── src/
│   ├── config/          # Configuration files
│   │   ├── database.js  # MongoDB config
│   │   └── redis.js     # Redis config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── models/          # Database models
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   │   └── cacheService.js  # Redis caching
│   └── __tests__/       # Test files
├── k8s/                 # Kubernetes manifests
├── docs/                # Documentation
├── scripts/             # Deployment scripts
├── docker-compose.yml   # Docker Compose config
├── Dockerfile.k8s       # Kubernetes Dockerfile
└── Makefile            # Build automation
```

## 🔧 Configuration

### Environment Variables

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/note-taking-app

# Redis (Optional)
REDIS_URL=redis://localhost:6379
REDIS_ENABLED=true

# JWT
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret

# App
NODE_ENV=development
PORT=8080
```

### Redis Caching

The app uses Redis for caching note lists with the following strategy:
- **Cache Key**: `notes:list:userId:{userId}:params:{hash}`
- **TTL**: 15 minutes (900 seconds)
- **Invalidation**: Cache cleared on create/update/delete
- **Fallback**: Graceful degradation to MongoDB if Redis unavailable

## 🚀 Deployment

### Google Cloud Run (Recommended for Production)

```powershell
# Quick setup and deploy
.\scripts\setup-secrets.ps1    # Setup secrets first
.\scripts\deploy-cloudrun.ps1  # Deploy to Cloud Run

# Or use Cloud Build directly
gcloud builds submit --config cloudbuild.yaml
```

See [Cloud Run Deployment Guide](docs/CLOUD_RUN_DEPLOYMENT.md) for detailed instructions.

### Docker Compose (Development)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Kubernetes (Production)

```bash
# Deploy to Minikube
make k8s

# Deploy to Kind
make k8s-kind

# Deploy to production cluster
kubectl apply -k k8s/
```

### Podman (Linux)

```bash
# Deploy with Podman
make podman

# View logs
make podman-logs

# Stop services
make podman-stop
```

## 📊 Monitoring

### Health Checks

- **Liveness**: `GET /health/live` - Basic app health
- **Readiness**: `GET /health/ready` - Database and cache connectivity

### Logs

```bash
# Docker
docker-compose logs -f

# Kubernetes
kubectl logs -f deployment/note-app -n note-taking-app

# Podman
podman logs -f note-taking-app
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run with coverage
npm run test:coverage
```

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- CORS configuration
- Input validation
- SQL injection protection (MongoDB)
- Network policies (Kubernetes)

## 📚 Documentation

- [Deployment Guide](docs/DEPLOYMENT.md) - Detailed deployment instructions
- [API Documentation](http://localhost:3000/api-docs) - Interactive API docs
- [Development Guide](docs/DEVELOPMENT.md) - Development setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License.

## 🆘 Support

For support and questions:
- Check the [documentation](docs/)
- Open an issue on GitHub
- Review the [troubleshooting guide](docs/DEPLOYMENT.md#troubleshooting)

---

**Happy Note Taking! 📝✨**
