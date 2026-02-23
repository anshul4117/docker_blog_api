# ---- Build Stage ----
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies (cached layer)
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Run as non-root user
USER node

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Start the app
CMD ["node", "server.js"]
