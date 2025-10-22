import crypto from 'crypto'
import { executeRedisCommand, getRedisClient, isConnected } from '../config/redis.js'

/**
 * Generate cache key for note list based on user ID and query parameters
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters (search, page, limit, sortBy, sortOrder)
 * @returns {string} - Cache key
 */
const generateCacheKey = (userId, queryParams) => {
  const {
    search = '',
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = queryParams

  // Create a normalized object for consistent hashing
  const normalizedParams = {
    search: search.trim(),
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    sortBy,
    sortOrder
  }

  // Convert to string and create hash
  const paramsString = JSON.stringify(normalizedParams)
  const hash = crypto.createHash('md5').update(paramsString).digest('hex')

  return `notes:list:userId:${userId}:params:${hash}`
}

/**
 * Get cached note list for a user
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @returns {Promise<Object|null>} - Cached data or null if not found/error
 */
const getCachedNotes = async (userId, queryParams) => {
  try {
    if (!isConnected()) {
      return null
    }

    const redisClient = getRedisClient()
    if (!redisClient) {
      return null
    }

    const cacheKey = generateCacheKey(userId, queryParams)
    const cachedData = await executeRedisCommand(redisClient.get.bind(redisClient), cacheKey)

    if (cachedData) {
      console.log(`Cache hit for user ${userId} with key: ${cacheKey}`)
      return JSON.parse(cachedData)
    }

    console.log(`Cache miss for user ${userId} with key: ${cacheKey}`)
    return null
  } catch (error) {
    console.error('Error getting cached notes:', error.message)
    return null
  }
}

/**
 * Set cached note list for a user
 * @param {string} userId - User ID
 * @param {Object} queryParams - Query parameters
 * @param {Object} data - Data to cache
 * @param {number} ttl - Time to live in seconds (default: 900 = 15 minutes)
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const setCachedNotes = async (userId, queryParams, data, ttl = 900) => {
  try {
    if (!isConnected()) {
      return false
    }

    const redisClient = getRedisClient()
    if (!redisClient) {
      return false
    }

    const cacheKey = generateCacheKey(userId, queryParams)
    const dataString = JSON.stringify(data)

    await executeRedisCommand(redisClient.setEx.bind(redisClient), cacheKey, ttl, dataString)
    console.log(`Cached notes for user ${userId} with key: ${cacheKey}, TTL: ${ttl}s`)
    return true
  } catch (error) {
    console.error('Error setting cached notes:', error.message)
    return false
  }
}

/**
 * Invalidate all cached note lists for a user
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
const invalidateUserNotes = async userId => {
  try {
    if (!isConnected()) {
      return false
    }

    const redisClient = getRedisClient()
    if (!redisClient) {
      return false
    }

    // Pattern to match all note list cache keys for this user
    const pattern = `notes:list:userId:${userId}:params:*`

    // Get all matching keys
    const keys = await executeRedisCommand(redisClient.keys.bind(redisClient), pattern)

    if (keys && keys.length > 0) {
      // Delete all matching keys
      await executeRedisCommand(redisClient.del.bind(redisClient), keys)
      console.log(`Invalidated ${keys.length} cache entries for user ${userId}`)
      return true
    }

    console.log(`No cache entries found for user ${userId}`)
    return true
  } catch (error) {
    console.error('Error invalidating user notes cache:', error.message)
    return false
  }
}

/**
 * Get cache statistics for debugging
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Object>} - Cache statistics
 */
const getCacheStats = async (userId = null) => {
  try {
    if (!isConnected()) {
      return { connected: false, stats: null }
    }

    const redisClient = getRedisClient()
    if (!redisClient) {
      return { connected: false, stats: null }
    }

    const pattern = userId ? `notes:list:userId:${userId}:params:*` : 'notes:list:userId:*:params:*'

    const keys = await executeRedisCommand(redisClient.keys.bind(redisClient), pattern)
    const keyCount = keys ? keys.length : 0

    return {
      connected: true,
      stats: {
        totalKeys: keyCount,
        pattern: pattern,
        userId: userId || 'all'
      }
    }
  } catch (error) {
    console.error('Error getting cache stats:', error.message)
    return { connected: false, stats: null, error: error.message }
  }
}

export { generateCacheKey, getCachedNotes, getCacheStats, invalidateUserNotes, setCachedNotes }
