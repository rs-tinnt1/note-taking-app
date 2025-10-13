import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import swaggerUi from 'swagger-ui-express'
import swaggerSpecs from './config/swagger.js'
import noteRoutes from './routes/noteRoutes.js'
import userRoutes from './routes/userRoutes.js'
import authRoutes from './routes/authRoutes.js'

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

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Note Taking App API Documentation'
}))

// Routes
console.log('Registering auth routes...')
app.use('/api/auth', authRoutes)
console.log('Auth routes registered')
app.use('/api/notes', noteRoutes)
app.use('/api/users', userRoutes)

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Note Taking API',
    version: '1.0.0',
    documentation: '/api-docs',
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
