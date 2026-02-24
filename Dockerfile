# ============================================
# Dockerfile para FotoGestor - Next.js 16
# Optimizado para despliegue en Dokploy (FIX 502)
# ============================================

# Stage 1: Dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Instalar bun
RUN npm install -g bun

# Copiar archivos de dependencias
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Instalar dependencias
RUN bun install --frozen-lockfile

# Generar Prisma Client
RUN bunx prisma generate

# ============================================
# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app

RUN npm install -g bun

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Crear carpeta DB
RUN mkdir -p /app/db

# Build Next.js standalone
RUN bun run build

# ============================================
# Stage 3: Producción (Runner)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Usuario no root (seguridad)
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios del build standalone
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Directorio para SQLite / DB local
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app

# Copiar entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs

# Puerto que usa Next.js standalone
EXPOSE 3000

# 🔥 HEALTHCHECK CORREGIDO (NO usar endpoints de auth)
# Esto evita 502 en Dokploy/Traefik
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/ || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]