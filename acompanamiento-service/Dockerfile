# ==============================================================================
# Multi-stage Dockerfile for acompanamiento-service (Node.js 20 + Express)
# ==============================================================================

# Stage 1: Dependency installation
FROM node:20-alpine AS deps
WORKDIR /app

# Install system libraries for native dependencies if required
RUN apk add --no-cache libc6-compat

# Copy package manifests
COPY package.json package-lock.json* ./

# Install production dependencies
RUN npm install --omit=dev

# Stage 2: Minimal runtime image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Use unprivileged 'node' user for security compliance
USER node

# Copy installed production modules from deps stage
COPY --chown=node:node --from=deps /app/node_modules ./node_modules
# Copy application source code
COPY --chown=node:node . .

# Expose microservice listening port
EXPOSE 3000

# Launch server
CMD ["node", "src/server.js"]
