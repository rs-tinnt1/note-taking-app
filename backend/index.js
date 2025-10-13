import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
dotenv.config({ path: join(__dirname, '.env') })

import app from './src/app.js'
import connectDB from './src/config/database.js'

const port = process.env.PORT || 8080

console.log('TEST port', process.env.PORT)
console.log('TEST URI', process.env.MONGODB_URI)

// Connect to database and start server
const startServer = async () => {
  try {
    await connectDB()
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
