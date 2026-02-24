#!/bin/sh
set -e

echo "🚀 Iniciando FotoGestor..."

# Esperar a que la base de datos esté lista (para MySQL/PostgreSQL)
if [ "$DATABASE_URL" != "" ] && [ "$DATABASE_URL" != "file:/app/db/custom.db" ]; then
  echo "⏳ Esperando conexión a la base de datos..."
  sleep 5
fi

# Ejecutar migraciones de Prisma
echo "📦 Ejecutando migraciones de base de datos..."
npx prisma db push --skip-generate 2>/dev/null || bunx prisma db push --skip-generate 2>/dev/null || echo "⚠️ No se pudieron ejecutar migraciones automáticamente"

echo "✅ Iniciando servidor..."
exec "$@"
