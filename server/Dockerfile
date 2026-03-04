# ============================================
# Dockerfile — Node.js Backend API
# ============================================
FROM node:18-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci

# Copy source and build
COPY tsconfig.json .
COPY src ./src/
RUN npx prisma generate
RUN npm run build

# --- Production Image ---
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy built assets and production deps
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production
RUN npx prisma generate

COPY --from=builder /app/dist ./dist

EXPOSE 3001

# Command to migrate db and start server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
