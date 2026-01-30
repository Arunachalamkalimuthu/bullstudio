FROM node:24-alpine AS base
RUN apk update
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm
WORKDIR /app

# Prepare stage -> prune monorepo for bullstudio package
FROM base AS prepare
RUN pnpm add -g turbo
COPY . .
RUN turbo prune bullstudio --docker

# BUILDER STAGE
FROM base AS builder
# Install dependencies
COPY --from=prepare /app/out/json/ .
RUN pnpm install --frozen-lockfile
# Copy source code and pruned files
COPY --from=prepare /app/out/full/ .
# Build the bullstudio package
RUN pnpm --filter bullstudio build

# RUNNER STAGE
FROM base AS runner
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 bullstudio
USER bullstudio

ENV NODE_ENV=production

COPY --from=builder --chown=bullstudio:nodejs /app/apps/cli/dist/ ./apps/cli/dist/

ARG PORT=4000

EXPOSE ${PORT}
ENV PORT=${PORT}

CMD ["node", "./apps/cli/dist/server/production.js"]

