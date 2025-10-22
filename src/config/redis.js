import { createClient } from 'redis'

let redisClient = null
let isRedisConnected = false

/**
 * Initialize Redis connection with graceful error handling
 * @returns {Promise<boolean>} - Returns true if connected, false if failed
 */
const connectRedis = async () => {
  try {
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'
    const redisEnabled = process.env.REDIS_ENABLED !== 'false' // Default to true

    if (!redisEnabled) {
      console.log('Redis is disabled via REDIS_ENABLED=false')
      return false
    }

    redisClient = createClient({
      url: redisUrl,
      retry_strategy: options => {
        if (options.error && options.error.code === 'ECONNREFUSED') {
          console.log('Redis server connection refused, retrying...')
          return new Error('Redis server connection refused')
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          console.log('Redis retry time exhausted')
          return new Error('Retry time exhausted')
        }
        if (options.attempt > 10) {
          console.log('Redis max retry attempts reached')
          return undefined
        }
        return Math.min(options.attempt * 100, 3000)
      }
    })

    // Handle connection events
    redisClient.on('connect', () => {
      console.log('Redis client connected')
    })

    redisClient.on('ready', () => {
      console.log('Redis client ready')
      isRedisConnected = true
    })

    redisClient.on('error', err => {
      console.error('Redis client error:', err.message)
      isRedisConnected = false
    })

    redisClient.on('end', () => {
      console.log('Redis client disconnected')
      isRedisConnected = false
    })

    await redisClient.connect()
    return true
  } catch (error) {
    console.error('Failed to connect to Redis:', error.message)
    console.log('Application will continue without Redis caching')
    isRedisConnected = false
    return false
  }
}

/**
 * Get Redis client instance
 * @returns {Object|null} - Redis client or null if not connected
 */
const getRedisClient = () => (isRedisConnected ? redisClient : null)

/**
 * Check if Redis is connected and ready
 * @returns {boolean} - True if Redis is connected
 */
const isConnected = () => isRedisConnected && redisClient !== null

/**
 * Gracefully close Redis connection
 * @returns {Promise<void>}
 */
const closeRedis = async () => {
  try {
    if (redisClient && isRedisConnected) {
      await redisClient.quit()
      console.log('Redis connection closed')
    }
  } catch (error) {
    console.error('Error closing Redis connection:', error.message)
  } finally {
    isRedisConnected = false
    redisClient = null
  }
}

/**
 * Execute Redis command with error handling
 * @param {Function} command - Redis command function
 * @param {...any} args - Command arguments
 * @returns {Promise<any>} - Command result or null if error
 */
const executeRedisCommand = async (command, ...args) => {
  try {
    if (!isConnected()) {
      return null
    }
    return await command(...args)
  } catch (error) {
    console.error('Redis command error:', error.message)
    return null
  }
}

export { closeRedis, connectRedis, executeRedisCommand, getRedisClient, isConnected }
