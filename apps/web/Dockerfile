# ----------------------------------------
# Base stage - setup pnpm and node
# ----------------------------------------
FROM node:20-alpine AS base

RUN apk update
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Enable corepack and pnpm
RUN corepack enable pnpm

# ----------------------------------------
# Pruner stage - prune monorepo for web app
# ----------------------------------------
FROM base AS pruner
WORKDIR /app
RUN pnpm add -g turbo
COPY . .
RUN turbo prune web --docker

# ----------------------------------------
# Builder stage - install deps and build
# ----------------------------------------
FROM base AS builder
WORKDIR /app

# Install dependencies first (leverages Docker layer caching)
COPY --from=pruner /app/out/json/ .
RUN pnpm install --frozen-lockfile

# Copy source code and build
COPY --from=pruner /app/out/full/ .

# Generate Prisma client
RUN pnpm --filter @bullstudio/prisma prisma:generate

# Build the app
ARG DATABASE_URL
ARG DIRECT_URL
ENV DATABASE_URL=${DATABASE_URL}
ENV DIRECT_URL=${DIRECT_URL}
RUN pnpm turbo build --filter=web

# ----------------------------------------
# Runner stage - minimal production image
# ----------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy static assets
COPY --from=builder /app/apps/web/public ./public

# Copy standalone server
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "apps/web/server.js"]
