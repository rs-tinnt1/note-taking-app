# Note Taking App Backend

A Node.js/Express backend API for a note-taking application with JWT authentication and logical deletion.

## Features

- JWT Authentication with access and refresh tokens
- User CRUD operations with password encryption
- Note CRUD operations with user ownership
- Logical deletion (soft delete) for all entities
- MongoDB integration with Mongoose
- CORS support
- Environment variable validation

## Prerequisites

- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB database

## Environment Variables

Create a `.env` file in the root directory with the following variables:

### Required Variables
```env
MONGODB_URI=mongodb://localhost:27017/note-taking-app
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
```

### Optional Variables
```env
PORT=8080
NODE_ENV=development
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CORS_ORIGIN=http://localhost:3000
CORS_CREDENTIALS=true
```

## Installation

```bash
npm install
```

## Available Scripts

### Development
```bash
npm run dev          # Start development server with nodemon
```

### Production
```bash
npm run build        # Validate environment and build (no compilation needed)
npm start           # Start production server
npm run start:prod  # Start production server with NODE_ENV=production
```

### Build and Start
```bash
npm run start:build      # Build and start
npm run start:prod:build # Build and start in production mode
```

### Utilities
```bash
npm run validate:env  # Validate environment variables
npm run clean        # Clean build artifacts
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user (requires auth)
- `POST /api/auth/refresh` - Refresh access token

### Notes (All require authentication)
- `GET /api/notes` - Get all user's notes
- `POST /api/notes` - Create new note
- `GET /api/notes/:id` - Get note by ID
- `PUT /api/notes/:id` - Update note by ID
- `DELETE /api/notes/:id` - Delete note by ID (logical deletion)

### Users (All require authentication)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user by ID
- `PUT /api/users/:id/password` - Update user password
- `DELETE /api/users/:id` - Delete user by ID (logical deletion)

## Logical Deletion

All entities (User, Note, RefreshToken) use logical deletion:
- Records are not physically deleted from the database
- A `deletedAt` field is set to the deletion timestamp
- All queries automatically exclude logically deleted records
- Cascade deletion: deleting a user also logically deletes all their notes

## Database Models

### User
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, encrypted)
- `deletedAt`: Date (null if not deleted)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### Note
- `title`: String (required)
- `content`: String (required)
- `owner`: ObjectId (ref: User, required)
- `deletedAt`: Date (null if not deleted)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

### RefreshToken
- `token`: String (required, unique)
- `userId`: ObjectId (ref: User, required)
- `expiresAt`: Date (required, TTL index)
- `deletedAt`: Date (null if not deleted)
- `createdAt`: Date (auto-generated)
- `updatedAt`: Date (auto-generated)

## Security Features

- Password hashing with bcryptjs
- JWT tokens with configurable expiration
- Refresh token rotation
- CORS protection
- Input validation and sanitization
- Logical deletion for data recovery

## Error Handling

All API responses follow a consistent format:
```json
{
  "success": boolean,
  "message": string,
  "data": object (optional)
}
```

## License

ISC
