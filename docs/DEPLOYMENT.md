# 🚀 Deployment Guide - Note Taking App

Hướng dẫn deploy ứng dụng Note Taking App với Redis caching trên local environment sử dụng Kubernetes, Docker và Podman.

## 📋 Mục lục

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Podman Deployment](#podman-deployment)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### Cho Kubernetes:
- [kubectl](https://kubernetes.io/docs/tasks/tools/)
- [minikube](https://minikube.sigs.k8s.io/docs/start/) hoặc [kind](https://kind.sigs.k8s.io/)
- [Docker](https://docs.docker.com/get-docker/) hoặc [Podman](https://podman.io/getting-started/installation)

### Cho Docker/Podman:
- [Docker](https://docs.docker.com/get-docker/) hoặc [Podman](https://podman.io/getting-started/installation)
- [Docker Compose](https://docs.docker.com/compose/install/)

## ⚡ Quick Start

### 1. Clone và setup
```bash
git clone <your-repo>
cd note-taking-app
npm install
```

### 2. Chọn phương thức deploy:

| Phương thức | Độ phức tạp | Phù hợp cho |
|-------------|-------------|-------------|
| **Docker Compose** | ⭐ | Development, Testing |
| **Kubernetes** | ⭐⭐⭐ | Production, Learning |
| **Podman** | ⭐⭐ | Linux, Security-focused |

---

## 🐳 Docker Deployment

### Sử dụng Docker Compose (Khuyến nghị cho dev)

#### 1. Tạo file .env
```bash
cp env.example .env
```

#### 2. Chạy ứng dụng
```bash
# Start tất cả services
docker-compose up -d

# Xem logs
docker-compose logs -f

# Stop
docker-compose down
```

#### 3. Truy cập ứng dụng
- **API**: http://localhost:3000
- **API Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

#### 4. Kiểm tra services
```bash
# Xem status
docker-compose ps

# Kiểm tra logs từng service
docker-compose logs mongodb
docker-compose logs redis
docker-compose logs app
```

### Sử dụng Docker thủ công

#### 1. Build image
```bash
docker build -t note-taking-app:latest .
```

#### 2. Tạo network
```bash
docker network create note-app-network
```

#### 3. Chạy MongoDB
```bash
docker run -d \
  --name mongodb \
  --network note-app-network \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=note-taking-app \
  -p 27017:27017 \
  mongo:7.0
```

#### 4. Chạy Redis
```bash
docker run -d \
  --name redis \
  --network note-app-network \
  -p 6379:6379 \
  redis:7-alpine
```

#### 5. Chạy ứng dụng
```bash
docker run -d \
  --name note-app \
  --network note-app-network \
  -p 3000:8080 \
  -e MONGODB_URI=mongodb://admin:password@mongodb:27017/note-taking-app?authSource=admin \
  -e REDIS_URL=redis://redis:6379 \
  -e JWT_SECRET=your-secret-key \
  -e JWT_REFRESH_SECRET=your-refresh-secret \
  note-taking-app:latest
```

---

## ☸️ Kubernetes Deployment

### Sử dụng Minikube (Khuyến nghị)

#### 1. Start Minikube
```bash
# Start minikube
minikube start

# Enable ingress addon
minikube addons enable ingress

# Kiểm tra status
minikube status
```

#### 2. Build và load image
```bash
# Build image
docker build -f Dockerfile.k8s -t note-taking-app:latest .

# Load vào minikube
minikube image load note-taking-app:latest
```

#### 3. Deploy lên Kubernetes
```bash
# Deploy tất cả resources
kubectl apply -k k8s/

# Hoặc deploy từng file
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-pvc.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

#### 4. Kiểm tra deployment
```bash
# Xem tất cả resources
kubectl get all -n note-taking-app

# Xem pods
kubectl get pods -n note-taking-app

# Xem logs
kubectl logs -f deployment/note-app -n note-taking-app
```

#### 5. Truy cập ứng dụng
```bash
# Lấy URL
minikube service note-app-service -n note-taking-app --url

# Hoặc sử dụng port-forward
kubectl port-forward svc/note-app-service 3000:80 -n note-taking-app
```

Truy cập: http://localhost:3000

### Sử dụng Kind

#### 1. Tạo cluster
```bash
# Tạo kind cluster
kind create cluster --name note-app

# Kiểm tra
kubectl cluster-info
```

#### 2. Build và load image
```bash
# Build image
docker build -f Dockerfile.k8s -t note-taking-app:latest .

# Load vào kind
kind load docker-image note-taking-app:latest --name note-app
```

#### 3. Deploy
```bash
kubectl apply -k k8s/
```

#### 4. Port forward để truy cập
```bash
kubectl port-forward svc/note-app-service 3000:80 -n note-taking-app
```

---

## 🐧 Podman Deployment

### Sử dụng Podman Compose

#### 1. Cài đặt podman-compose
```bash
# Ubuntu/Debian
sudo apt install podman-compose

# Hoặc cài từ pip
pip install podman-compose
```

#### 2. Chạy ứng dụng
```bash
# Start services
podman-compose up -d

# Xem logs
podman-compose logs -f

# Stop
podman-compose down
```

### Sử dụng Podman thủ công

#### 1. Tạo network
```bash
podman network create note-app-network
```

#### 2. Chạy MongoDB
```bash
podman run -d \
  --name mongodb \
  --network note-app-network \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=password \
  -e MONGO_INITDB_DATABASE=note-taking-app \
  -p 27017:27017 \
  docker.io/mongo:7.0
```

#### 3. Chạy Redis
```bash
podman run -d \
  --name redis \
  --network note-app-network \
  -p 6379:6379 \
  docker.io/redis:7-alpine
```

#### 4. Build và chạy ứng dụng
```bash
# Build image
podman build -f Dockerfile.k8s -t note-taking-app:latest .

# Chạy ứng dụng
podman run -d \
  --name note-app \
  --network note-app-network \
  -p 3000:8080 \
  -e MONGODB_URI=mongodb://admin:password@mongodb:27017/note-taking-app?authSource=admin \
  -e REDIS_URL=redis://redis:6379 \
  -e JWT_SECRET=your-secret-key \
  -e JWT_REFRESH_SECRET=your-refresh-secret \
  note-taking-app:latest
```

---

## 🔍 Troubleshooting

### Common Issues

#### 1. **Pods không start được**
```bash
# Kiểm tra events
kubectl get events -n note-taking-app --sort-by='.lastTimestamp'

# Xem logs chi tiết
kubectl describe pod <pod-name> -n note-taking-app
```

#### 2. **Database connection failed**
```bash
# Kiểm tra MongoDB
kubectl logs deployment/mongodb -n note-taking-app

# Test connection
kubectl exec -it deployment/mongodb -n note-taking-app -- mongosh
```

#### 3. **Redis connection failed**
```bash
# Kiểm tra Redis
kubectl logs deployment/redis -n note-taking-app

# Test connection
kubectl exec -it deployment/redis -n note-taking-app -- redis-cli ping
```

#### 4. **App không accessible**
```bash
# Kiểm tra service
kubectl get svc -n note-taking-app

# Port forward để test
kubectl port-forward svc/note-app-service 3000:80 -n note-taking-app
```

### Debug Commands

#### Kubernetes
```bash
# Xem tất cả resources
kubectl get all -n note-taking-app

# Xem logs real-time
kubectl logs -f deployment/note-app -n note-taking-app

# Vào trong pod
kubectl exec -it deployment/note-app -n note-taking-app -- sh

# Xem resource usage
kubectl top pods -n note-taking-app
```

#### Docker/Podman
```bash
# Xem containers
docker ps
podman ps

# Xem logs
docker logs note-app
podman logs note-app

# Vào trong container
docker exec -it note-app sh
podman exec -it note-app sh
```

### Performance Tuning

#### 1. **Tăng replicas cho app**
```bash
kubectl scale deployment note-app --replicas=3 -n note-taking-app
```

#### 2. **Tăng resource limits**
Chỉnh sửa `k8s/app-deployment.yaml`:
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

#### 3. **Tối ưu Redis**
Chỉnh sửa `k8s/redis-deployment.yaml`:
```yaml
command:
- redis-server
- --maxmemory
- "512mb"
- --maxmemory-policy
- "allkeys-lru"
```

---

## 📊 Monitoring

### Health Checks

- **Liveness**: `GET /health/live` - App còn hoạt động
- **Readiness**: `GET /health/ready` - App sẵn sàng nhận request

### Logs

```bash
# Kubernetes
kubectl logs -f deployment/note-app -n note-taking-app

# Docker
docker logs -f note-app

# Podman
podman logs -f note-app
```

### Metrics

```bash
# Kubernetes resource usage
kubectl top pods -n note-taking-app

# Container stats
docker stats
podman stats
```

---

## 🧹 Cleanup

### Kubernetes
```bash
# Xóa tất cả resources
kubectl delete -k k8s/

# Hoặc xóa namespace
kubectl delete namespace note-taking-app
```

### Docker
```bash
# Stop và xóa containers
docker-compose down

# Xóa images
docker rmi note-taking-app:latest
```

### Podman
```bash
# Stop và xóa containers
podman-compose down

# Xóa images
podman rmi note-taking-app:latest
```

---

## 🎯 Next Steps

1. **Production Setup**: Sử dụng managed databases (MongoDB Atlas, Redis Cloud)
2. **Monitoring**: Thêm Prometheus + Grafana
3. **Logging**: Thêm ELK stack
4. **Security**: Sử dụng external secret management
5. **CI/CD**: Tự động build và deploy

---

## 📚 Additional Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Podman Documentation](https://docs.podman.io/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
