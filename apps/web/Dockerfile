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
COPY apps/web apps/web

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared-types package first
RUN pnpm --filter @dineposai/shared-types build

# Build the Next.js web application
RUN pnpm --filter web build

# Set environment
ENV NODE_ENV=production
EXPOSE 3000

# Start command
CMD ["pnpm", "--filter", "web", "start"]
