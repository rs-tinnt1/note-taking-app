/**
 * Helper utilities for mocking chainable Mongoose queries
 * Simplifies the process of mocking complex query chains like .find().select().sort()
 */

/**
 * Creates a mock chainable query object that mimics Mongoose query behavior
 * @param {*} finalResult - The final result that the query should return
 * @returns {Object} Mock query object with chainable methods
 */
export const createChainableQuery = finalResult => {
  const query = {
    select: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(finalResult)
  }

  // Make it thenable for await syntax
  query.then = resolve => Promise.resolve(finalResult).then(resolve)

  return query
}

/**
 * Creates a mock query that returns a specific result for findOne operations
 * @param {*} result - The result to return
 * @returns {Object} Mock query object
 */
export const createFindOneQuery = result => ({
  select: jest.fn().mockResolvedValue(result),
  exec: jest.fn().mockResolvedValue(result)
})

/**
 * Creates a mock query for count operations
 * @param {number} count - The count to return
 * @returns {Object} Mock query object
 */
export const createCountQuery = count => ({
  exec: jest.fn().mockResolvedValue(count)
})
