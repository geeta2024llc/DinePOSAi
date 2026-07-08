# Base node image
FROM node:20-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy root configurations and workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.json ./

# Copy required workspace packages
COPY packages/shared-types packages/shared-types
COPY apps/api apps/api

# Install dependencies (only production deps if needed, but simple pnpm install is safest)
RUN pnpm install --frozen-lockfile

# Build shared-types package first
RUN pnpm --filter @dineposai/shared-types build

# Build the Express API backend
RUN pnpm --filter @dineposai/api build

# Set environment
ENV NODE_ENV=production
EXPOSE 4000

# Start command
CMD ["pnpm", "--filter", "@dineposai/api", "start"]
