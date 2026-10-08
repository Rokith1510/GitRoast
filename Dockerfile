# ==============================================================================
# GitRoast — Google Cloud Run Production Dockerfile
# Lightweight, multi-stage, hardened Node.js container
# ==============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package.json ./

# Install production dependencies only
RUN npm install --omit=dev --ignore-scripts && npm cache clean --force

# ==============================================================================
# Runner Stage
# ==============================================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
# Google Cloud Run injects PORT (default 8080)
ENV PORT=8080

# Create unprivileged user for security
USER node

# Copy production node_modules from builder
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node package.json ./

# Copy application source code and public assets
COPY --chown=node:node src/ ./src/
COPY --chown=node:node public/ ./public/

# Expose Cloud Run default port
EXPOSE 8080

# Healthcheck for container orchestration
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-8080}/api/health || exit 1

# Production start command
CMD ["node", "src/server.js"]
