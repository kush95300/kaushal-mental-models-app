FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json* ./
COPY prisma ./prisma
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/prisma/dev.db"

# Generate Prisma client and build Next.js
RUN npx prisma generate
RUN npm run build

# Clean up unused build dependencies, other platform engines, and WASM files to optimize image size
RUN rm -rf \
    /app/.next/standalone/node_modules/typescript \
    /app/.next/standalone/node_modules/.prisma/client/libquery_engine-darwin-* \
    /app/.next/standalone/node_modules/.prisma/client/*.dylib \
    /app/.next/standalone/node_modules/@prisma/client/runtime/*.wasm-base64.js \
    /app/.next/standalone/node_modules/@prisma/client/runtime/*.wasm \
    /app/.next/standalone/node_modules/@img/sharp-darwin-* \
    /app/.next/standalone/node_modules/@img/sharp-libvips-darwin-* \
    /app/.next/standalone/node_modules/@img/sharp-linux-arm64 \
    /app/.next/standalone/node_modules/@img/sharp-linux-x64 \
    /app/.next/standalone/node_modules/@img/sharp-libvips-linux-arm64 \
    /app/.next/standalone/node_modules/@img/sharp-libvips-linux-x64

# Production image, copy all the files and run next
FROM base AS runner
RUN apk add --no-cache openssl
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="file:/app/prisma/dev.db"
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN mkdir -p prisma
RUN chown nextjs:nodejs .next
RUN chown -R nextjs:nodejs prisma

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

USER nextjs
EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
