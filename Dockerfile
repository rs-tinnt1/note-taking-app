# Multi-stage build optimized for Cloud Run
# Use specific version for reproducible builds
FROM node:18.20.5-alpine3.20 AS base

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY package*.json ./

# ==========================================
# Dependencies stage - cache layer
# ==========================================
FROM base AS dependencies

# Install production dependencies only
# Use npm ci for faster, deterministic installs
RUN npm ci --only=production --ignore-scripts && \
    npm cache clean --force

# ==========================================
# Development stage (optional)
# ==========================================
FROM base AS development

# Install all dependencies including dev
RUN npm ci --ignore-scripts

# Copy source code
COPY . .

EXPOSE 8080
CMD ["npm", "run", "dev"]

# ==========================================
# Production build stage
# ==========================================
FROM base AS production

# Set production environment
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=error

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001 -G nodejs

# Copy production dependencies from dependencies stage
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copy application source code
COPY --chown=nodejs:nodejs package*.json ./
COPY --chown=nodejs:nodejs index.js ./
COPY --chown=nodejs:nodejs src ./src

# Create uploads directory with proper permissions
RUN mkdir -p uploads/avatars && \
    chown -R nodejs:nodejs uploads && \
    chmod -R 755 uploads

# Switch to non-root user
USER nodejs

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Use dumb-init to handle signals properly (graceful shutdown)
ENTRYPOINT ["dumb-init", "--"]

# Start application directly with node (faster than npm)
CMD ["node", "index.js"]
