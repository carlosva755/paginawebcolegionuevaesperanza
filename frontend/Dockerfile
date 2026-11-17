# ==============================================================================
# Multi-stage Dockerfile for frontend (React + Vite -> Nginx Alpine)
# ==============================================================================

# Stage 1: Build the Vite SPA application
FROM node:20-alpine AS build
WORKDIR /app

# Build arguments for injecting API base URLs at build time
ARG VITE_ALERTAS_API_URL
ARG VITE_ACOMPANAMIENTO_API_URL

ENV VITE_ALERTAS_API_URL=$VITE_ALERTAS_API_URL
ENV VITE_ACOMPANAMIENTO_API_URL=$VITE_ACOMPANAMIENTO_API_URL

# Copy package manifests
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy application source code
COPY . .

# Generate optimized production bundle in /app/dist
RUN npm run build

# Stage 2: Minimal Nginx web server for static file hosting
FROM nginx:1.25-alpine AS runtime

# Copy optimized Nginx configuration with SPA routing support
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled React output to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Launch Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
