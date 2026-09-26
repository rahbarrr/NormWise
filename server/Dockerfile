# Multi-stage production build for NormWise Backend API (Phase 19)

# Stage 1: Build stage for Prisma client generation and dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies for native bindings if required
RUN apk add --no-cache openssl libc6-compat

# Copy package descriptors and prisma schema
COPY package.json package-lock.json ./
COPY prisma/ ./prisma/

# Install all dependencies including devDependencies for prisma generate
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Minimal hardened runtime image
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime OpenSSL required by Prisma
RUN apk add --no-cache openssl libc6-compat dumb-init

# Set production environment
ENV NODE_ENV=production
ENV PORT=5001

# Copy package files and install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy generated Prisma Client from builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Copy application source code, database migration files, and utility scripts
COPY src/ ./src/
COPY prisma/ ./prisma/
COPY bin/ ./bin/

# Prepare dedicated private storage directory and assign non-root permissions
RUN mkdir -p /app/uploads /app/backups && \
    chown -R node:node /app

# Switch to non-root node user
USER node

# Expose backend API port
EXPOSE 5001

# Container healthcheck using liveness endpoint
HEALTHCHECK --interval=20s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:5001/api/health || exit 1

# dumb-init handles PID 1 signal forwarding for clean SIGTERM / SIGINT graceful shutdown
ENTRYPOINT ["/usr/bin/dumb-init", "--"]

CMD ["npm", "start"]
