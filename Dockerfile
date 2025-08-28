# Multi-stage build for Image Generator Application
# Stage 1: Build the client (React + Vite)
FROM node:24-alpine AS client-builder

WORKDIR /app

# Copy client package files
COPY package*.json ./
COPY tsconfig*.json ./
COPY vite.config.ts ./

# Install client dependencies
RUN npm ci

# Copy client source code
COPY src/ ./src/
COPY public/ ./public/
COPY index.html ./

# Build the client
RUN npm run build

# Stage 2: Build the server (Optimized TypeScript server)
FROM node:24-alpine AS server-builder

WORKDIR /app/server

# Copy server package files
COPY server/package*.json ./
COPY server/tsconfig.json ./

# Install server dependencies
RUN npm ci --only=production && npm ci --only=development

# Copy server source code
COPY server/src/ ./src/

# Build the server
RUN npm run build

# Stage 3: Production runtime
FROM node:24-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory
WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeapp -u 1001

# Copy server build and dependencies
COPY --from=server-builder /app/server/dist ./server/
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/node_modules ./server/node_modules/

# Copy client build
COPY --from=client-builder /app/dist ./client/

# Create startup script
COPY <<EOF /app/start.sh
#!/bin/sh
set -e

echo "Starting Image Generator Application..."

# Start the server which will also serve static files
echo "Starting server with static file serving..."
cd /app/server && node server.js &
SERVER_PID=\$!

# Function to handle shutdown
shutdown() {
    echo "Shutting down gracefully..."
    kill \$SERVER_PID 2>/dev/null || true
    wait \$SERVER_PID 2>/dev/null || true
    exit 0
}

# Set up signal handlers
trap shutdown SIGTERM SIGINT

echo "✅ Application started successfully!"
echo "🌐 Application: http://localhost:\${PORT:-3000}"

# Wait for the server process
wait \$SERVER_PID
EOF

RUN chmod +x /app/start.sh

# Change ownership to non-root user
RUN chown -R nodeapp:nodejs /app

# Switch to non-root user
USER nodeapp

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/api/health || exit 1

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]
CMD ["/app/start.sh"]