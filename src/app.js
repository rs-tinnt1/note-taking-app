import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './config/swagger.js'
import authRoutes from './routes/authRoutes.js'
import noteRoutes from './routes/noteRoutes.js'
import userRoutes from './routes/userRoutes.js'

const app = express()

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true' || false
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'))

// Swagger Documentation
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Note Taking App API Documentation'
  })
)

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/users', userRoutes)

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

app.get('/health/ready', async (req, res) => {
  try {
    // Check database connection
    const mongoose = await import('mongoose')
    const dbState = mongoose.default.connection.readyState
    const isDbConnected = dbState === 1

    // Check Redis connection (optional)
    const { isConnected: isRedisConnected } = await import('./config/redis.js')
    const redisStatus = isRedisConnected() ? 'connected' : 'disconnected'

    if (isDbConnected) {
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'connected',
        cache: redisStatus,
        uptime: process.uptime()
      })
    } else {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        cache: redisStatus,
        uptime: process.uptime()
      })
    }
  } catch (error) {
    res.status(503).json({
      status: 'not ready',
      timestamp: new Date().toISOString(),
      database: 'error',
      cache: 'unknown',
      error: error.message,
      uptime: process.uptime()
    })
  }
})

app.get('/health/live', (req, res) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    pid: process.pid
  })
})

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Note Taking API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/health',
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new user',
        'POST /api/auth/login': 'Login user',
        'POST /api/auth/logout': 'Logout user (requires auth)',
        'POST /api/auth/refresh': 'Refresh access token'
      },
      notes: {
        'GET /api/notes': 'Get all notes (requires auth)',
        'POST /api/notes': 'Create a new note (requires auth)',
        'GET /api/notes/:id': 'Get note by ID (requires auth)',
        'PUT /api/notes/:id': 'Update note by ID (requires auth)',
        'DELETE /api/notes/:id': 'Delete note by ID (requires auth)'
      },
      users: {
        'GET /api/users': 'Get all users',
        'POST /api/users': 'Create a new user',
        'GET /api/users/:id': 'Get user by ID',
        'PUT /api/users/:id': 'Update user by ID',
        'PUT /api/users/:id/password': 'Update user password',
        'DELETE /api/users/:id': 'Delete user by ID (cascade delete notes)'
      }
    }
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  })
})

// Error handling middleware (for future expansion)
app.use((err, req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  })
})

export default app
