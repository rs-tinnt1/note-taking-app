# Test Suite Documentation

This directory contains comprehensive unit and integration tests for the Note Taking API.

## Test Structure

```
src/__tests__/
├── config/
│   └── test.env                 # Test environment variables
├── controllers/
│   ├── authController.test.js   # Authentication controller tests
│   ├── noteController.test.js   # Note controller tests
│   └── userController.test.js   # User controller tests
├── integration/
│   └── api.test.js             # API integration tests
├── middleware/
│   └── auth.test.js            # Authentication middleware tests
├── models/
│   ├── Note.test.js            # Note model tests
│   ├── RefreshToken.test.js    # RefreshToken model tests
│   └── User.test.js            # User model tests
├── services/
│   └── authService.test.js     # Authentication service tests
├── setup.js                    # Test setup and configuration
└── README.md                   # This file
```

## Test Categories

### 1. Model Tests (`models/`)
- **User.test.js**: Tests user schema validation, password hashing, logical deletion methods
- **Note.test.js**: Tests note schema validation, owner relationships, logical deletion methods
- **RefreshToken.test.js**: Tests refresh token schema, TTL index, logical deletion methods

### 2. Service Tests (`services/`)
- **authService.test.js**: Tests JWT token generation, verification, and error handling

### 3. Controller Tests (`controllers/`)
- **authController.test.js**: Tests authentication endpoints (register, login, logout, refresh)
- **noteController.test.js**: Tests note CRUD operations with authentication
- **userController.test.js**: Tests user management operations with authentication

### 4. Middleware Tests (`middleware/`)
- **auth.test.js**: Tests authentication middleware with various token scenarios

### 5. Integration Tests (`integration/`)
- **api.test.js**: Tests complete API workflows and cross-component interactions

## Running Tests

### Prerequisites
- MongoDB running on localhost:27017
- Node.js 18+ installed
- All dependencies installed (`npm install`)

### Test Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci

# Run specific test file
npm test -- --testPathPattern=authController

# Run tests matching a pattern
npm test -- --testNamePattern="should create a valid user"

# Run tests with verbose output
npm test -- --verbose
```

### Test Environment

Tests use a separate test database (`note-taking-app-test`) to avoid affecting development data.

**Test Environment Variables:**
- `NODE_ENV=test`
- `MONGODB_URI_TEST=mongodb://localhost:27017/note-taking-app-test`
- `JWT_SECRET=test-jwt-secret-key-for-testing-only`
- `JWT_REFRESH_SECRET=test-jwt-refresh-secret-key-for-testing-only`

## Test Coverage

The test suite aims for comprehensive coverage including:

### Model Tests
- ✅ Schema validation (required fields, data types, constraints)
- ✅ Password hashing and comparison
- ✅ Logical deletion methods
- ✅ Static methods for querying
- ✅ Instance methods
- ✅ Relationships and population

### Service Tests
- ✅ JWT token generation (access and refresh)
- ✅ Token verification and validation
- ✅ Error handling for invalid tokens
- ✅ Token expiration handling

### Controller Tests
- ✅ CRUD operations
- ✅ Authentication requirements
- ✅ Input validation
- ✅ Error handling
- ✅ Response formatting
- ✅ User authorization

### Middleware Tests
- ✅ Token validation
- ✅ User authentication
- ✅ Error handling
- ✅ Request object population

### Integration Tests
- ✅ Complete authentication flows
- ✅ End-to-end API workflows
- ✅ Cross-component interactions
- ✅ Error propagation

## Test Data Management

### Setup and Teardown
- **Before All**: Connect to test database
- **Before Each**: Create fresh test data
- **After Each**: Clean up collections
- **After All**: Drop test database and close connection

### Test Data Isolation
- Each test creates its own test data
- Tests are independent and can run in any order
- No shared state between tests

## Mocking and Stubbing

### Authentication Mocking
- Mock authentication middleware for controller tests
- Simulate authenticated requests with test user IDs
- Test both authenticated and unauthenticated scenarios

### Database Mocking
- Use real MongoDB for integration tests
- Clean database state between tests
- Test actual database operations

## Error Testing

### Validation Errors
- Test required field validation
- Test data type validation
- Test length constraints
- Test format validation (email, etc.)

### Authentication Errors
- Test missing tokens
- Test invalid tokens
- Test expired tokens
- Test wrong token types

### Authorization Errors
- Test access to other users' data
- Test access to deleted resources
- Test permission requirements

## Performance Considerations

### Test Timeout
- Default timeout: 10 seconds
- Database operations may take longer
- JWT operations are fast

### Database Cleanup
- Efficient collection clearing
- No unnecessary data retention
- Fast test execution

## Continuous Integration

### CI/CD Configuration
```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm install
    npm run test:ci
```

### Coverage Requirements
- Minimum 70% coverage for all metrics
- Branches, functions, lines, statements
- Coverage reports generated in `coverage/` directory

## Debugging Tests

### Verbose Output
```bash
npm test -- --verbose
```

### Debug Mode
```bash
npm test -- --detectOpenHandles --forceExit
```

### Specific Test Debugging
```bash
npm test -- --testNamePattern="specific test name" --verbose
```

## Best Practices

### Test Naming
- Use descriptive test names
- Follow pattern: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks

### Test Organization
- One test file per module
- Group tests by functionality
- Use `beforeEach` for common setup

### Assertions
- Use specific matchers
- Test both positive and negative cases
- Verify error messages and status codes

### Data Management
- Create minimal test data
- Use realistic test data
- Clean up after each test

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Ensure MongoDB is running
   - Check connection string
   - Verify database permissions

2. **Test Timeouts**
   - Increase timeout in Jest config
   - Check for hanging promises
   - Verify database cleanup

3. **Environment Variables**
   - Check test environment file
   - Verify variable loading
   - Ensure test-specific values

4. **Token Issues**
   - Verify JWT secrets
   - Check token expiration
   - Ensure proper token format

### Debug Commands
```bash
# Check test database connection
mongosh mongodb://localhost:27017/note-taking-app-test

# Run single test with debug output
npm test -- --testNamePattern="should create a valid user" --verbose

# Check test environment
node -e "console.log(process.env.NODE_ENV)"
```
