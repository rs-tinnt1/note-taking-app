# 📝 Note Taking App Backend

A Node.js/Express backend API for a note-taking application with JWT authentication and logical deletion.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB database

### Local Development
```bash
# Install dependencies
npm install

# Copy environment file
cp ../infrastructure/env.example .env

# Edit environment variables
nano .env

# Start development server
npm run dev
```

### Docker Development
```bash
# Navigate to infrastructure folder
cd ../infrastructure

# Start with Docker
make dev
```

## 📚 API Documentation

Once running, visit:
- **API Documentation**: http://localhost:8080/api-docs
- **Health Check**: http://localhost:8080/health

## 🛠️ Available Scripts

```bash
npm run dev          # Start development server
npm start           # Start production server
npm test            # Run tests
npm run test:unit   # Run unit tests
npm run test:integration # Run integration tests
npm run lint        # Run linting
npm run lint:fix    # Fix linting issues
```

## 🏗️ Infrastructure

All infrastructure-related files (Docker, deployment, monitoring) are located in the `../infrastructure/` folder.

For deployment and infrastructure management, see:
- **[Infrastructure README](../infrastructure/README.md)**
- **[Deployment Guide](../infrastructure/DEPLOYMENT.md)**

## 📁 Project Structure

```
backend/
├── src/                    # Source code
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── __tests__/         # Test files
├── uploads/               # File uploads
├── Dockerfile            # Container configuration
└── package.json          # Dependencies
```

## 🔧 Configuration

Copy `../infrastructure/env.example` to `.env` and configure:

```env
NODE_ENV=development
PORT=8080
MONGODB_URI=mongodb://localhost:27017/note-taking-app
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
```

## 📊 Features

- **JWT Authentication** with access/refresh tokens
- **User Management** with password encryption
- **Note Management** with user ownership
- **Logical Deletion** for data recovery
- **File Upload** support
- **Email Notifications** via SendGrid
- **Comprehensive Testing** (unit + integration)
- **API Documentation** with Swagger

## 🆘 Support

For infrastructure and deployment issues, see the [Infrastructure Documentation](../infrastructure/README.md).

For application development, check the source code and tests in the `src/` directory.

---

**Version**: 1.0.0  
**Last Updated**: $(date)