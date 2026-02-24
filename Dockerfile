# ============================================
# Dockerfile para FotoGestor - Next.js 16
# Optimizado para despliegue en Dokploy
# ============================================

# Stage 1: Instalar dependencias
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
# Stage 2: Build de la aplicación
FROM node:20-alpine AS builder
WORKDIR /app

# Instalar bun
RUN npm install -g bun

# Copiar dependencias
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables de entorno para build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Crear directorio de base de datos
RUN mkdir -p /app/db

# Build de Next.js
RUN bun run build

# ============================================
# Stage 3: Imagen de producción
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# Crear directorio para base de datos y asignar permisos
RUN mkdir -p /app/db && chown -R nextjs:nodejs /app/db

# Copiar script de inicio
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/auth/session || exit 1

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["node", "server.js"]
