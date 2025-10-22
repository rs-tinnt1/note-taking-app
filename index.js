import dotenv from 'dotenv'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

import app from './src/app.js'
import connectDB from './src/config/database.js'
import { connectRedis } from './src/config/redis.js'

const port = process.env.PORT || 8080

// Connect to database and start server
const startServer = async () => {
  try {
    // Connect to MongoDB (required)
    await connectDB()

    // Connect to Redis (optional - graceful degradation)
    const redisConnected = await connectRedis()
    if (redisConnected) {
      console.log('Redis cache layer enabled')
    } else {
      console.log('Redis cache layer disabled - using MongoDB only')
    }

    app.listen(port, () => {
      console.log(`Express server running at http://localhost:${port}`)
      console.log('Note Taking API is ready!')
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
