# Kubernetes Deployment for Note Taking App

This directory contains Kubernetes manifests for deploying the Note Taking App with Redis caching.

## Architecture

- **MongoDB**: Database with persistent storage
- **Redis**: Cache layer with persistent storage
- **Note App**: Node.js application with 3 replicas
- **Ingress**: External access with nginx-ingress
- **HPA**: Horizontal Pod Autoscaler for auto-scaling
- **Network Policies**: Security isolation

## Prerequisites

1. Kubernetes cluster (v1.19+)
2. nginx-ingress controller installed
3. Storage class available (e.g., `standard`)
4. Docker image built and pushed to registry

## Quick Start

### 1. Build and Push Docker Image

```bash
# Build the Docker image
docker build -t note-taking-app:latest .

# Tag for your registry
docker tag note-taking-app:latest your-registry/note-taking-app:latest

# Push to registry
docker push your-registry/note-taking-app:latest
```

### 2. Update Image in Manifests

Update the image reference in `k8s/app-deployment.yaml`:

```yaml
spec:
  containers:
  - name: note-app
    image: your-registry/note-taking-app:latest
```

### 3. Update Secrets

Update `k8s/secrets.yaml` with your actual base64 encoded secrets:

```bash
# Generate base64 encoded secrets
echo -n "your-jwt-secret" | base64
echo -n "your-refresh-secret" | base64
echo -n "admin" | base64
echo -n "password" | base64
```

### 4. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -k k8s/

# Or apply individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongodb-pvc.yaml
kubectl apply -f k8s/mongodb-deployment.yaml
kubectl apply -f k8s/redis-pvc.yaml
kubectl apply -f k8s/redis-deployment.yaml
kubectl apply -f k8s/app-deployment.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml
kubectl apply -f k8s/network-policy.yaml
```

### 5. Verify Deployment

```bash
# Check all resources
kubectl get all -n note-taking-app

# Check pods status
kubectl get pods -n note-taking-app

# Check services
kubectl get svc -n note-taking-app

# Check ingress
kubectl get ingress -n note-taking-app

# Check logs
kubectl logs -f deployment/note-app -n note-taking-app
kubectl logs -f deployment/mongodb -n note-taking-app
kubectl logs -f deployment/redis -n note-taking-app
```

### 6. Access the Application

Add to your `/etc/hosts` (or equivalent):
```
<INGRESS_IP> note-app.local
<INGRESS_IP> api.note-app.local
```

Access the application:
- API: http://note-app.local
- API Docs: http://note-app.local/api-docs
- Health Check: http://note-app.local/health

## Configuration

### Environment Variables

All environment variables are configured in `k8s/configmap.yaml` and `k8s/secrets.yaml`.

### Scaling

The application supports horizontal scaling via HPA:
- Min replicas: 2
- Max replicas: 10
- CPU threshold: 70%
- Memory threshold: 80%

### Storage

- MongoDB: 10Gi persistent volume
- Redis: 5Gi persistent volume
- App uploads: EmptyDir (ephemeral)

### Security

- Network policies restrict traffic between components
- Secrets are base64 encoded
- Ingress supports CORS

## Monitoring

### Health Checks

- **Liveness**: `/health/live` - Basic app health
- **Readiness**: `/health/ready` - Database and cache connectivity

### Logs

```bash
# Application logs
kubectl logs -f deployment/note-app -n note-taking-app

# Database logs
kubectl logs -f deployment/mongodb -n note-taking-app

# Cache logs
kubectl logs -f deployment/redis -n note-taking-app
```

### Metrics

```bash
# Check resource usage
kubectl top pods -n note-taking-app

# Check HPA status
kubectl get hpa -n note-taking-app
```

## Troubleshooting

### Common Issues

1. **Pods not starting**: Check resource limits and storage availability
2. **Database connection**: Verify MongoDB service and secrets
3. **Cache connection**: Verify Redis service
4. **Ingress not working**: Check nginx-ingress controller installation

### Debug Commands

```bash
# Describe problematic resources
kubectl describe pod <pod-name> -n note-taking-app
kubectl describe service <service-name> -n note-taking-app

# Check events
kubectl get events -n note-taking-app --sort-by='.lastTimestamp'

# Port forward for local testing
kubectl port-forward svc/note-app-service 8080:80 -n note-taking-app
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k k8s/

# Or delete namespace (removes everything)
kubectl delete namespace note-taking-app
```

## Production Considerations

1. **Use external managed databases** (MongoDB Atlas, Redis Cloud)
2. **Configure proper resource limits** based on load testing
3. **Set up monitoring** (Prometheus, Grafana)
4. **Configure backup** for persistent volumes
5. **Use TLS** for ingress
6. **Implement proper secret management** (external secret operators)
7. **Configure log aggregation** (ELK stack, Fluentd)
