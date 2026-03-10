# Multi-stage build for optimized production image

# Stage 1: Build
FROM node:20-bookworm-slim AS builder

WORKDIR /app

RUN apt-get update && \
  apt-get install -y --no-install-recommends openssl ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci && \
    npm cache clean --force

# Copy source code
COPY src ./src

# Generate Prisma client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Remove dev dependencies from builder output before copying to runtime image
RUN npm prune --omit=dev

# Stage 2: Production
FROM node:20-bookworm-slim

# Install runtime dependencies for Prisma and proper signal handling
RUN apt-get update && \
  apt-get install -y --no-install-recommends dumb-init openssl ca-certificates && \
  rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN groupadd --gid 1001 nodejs && \
  useradd --uid 1001 --gid 1001 --create-home --shell /usr/sbin/nologin nodejs

WORKDIR /app

RUN mkdir -p /app/logs && chown -R nodejs:nodejs /app

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://localhost:4000/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

# Start application with dumb-init
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
