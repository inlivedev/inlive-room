# Stage 0
FROM node:18-alpine AS base

# Stage 1
FROM base AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# Stage 2
FROM base AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN NODE_ENV=production npm run build && npm prune --omit=dev

# Stage 3
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 inlivegroup
RUN adduser --system --uid 1001 inliveuser
COPY --from=builder /app/public ./public
COPY --from=builder --chown=inliveuser:inlivegroup /app/.next/standalone ./
COPY --from=builder --chown=inliveuser:inlivegroup /app/.next/static ./.next/static
COPY --from=builder --chown=inliveuser:inlivegroup /app/node_modules ./node_modules
COPY --from=builder --chown=inliveuser:inlivegroup /app/dist/server.js ./server.js

USER inliveuser
EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"
CMD ["node", "server.js"]
