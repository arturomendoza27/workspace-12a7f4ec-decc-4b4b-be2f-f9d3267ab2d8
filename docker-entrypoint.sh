#!/bin/sh
set -e

echo "🚀 Iniciando FotoGestor..."

echo "⏳ Esperando base de datos..."
sleep 5

echo "🧱 Forzando estructura de base de datos desde schema.prisma..."
npx prisma db push --accept-data-loss || echo "⚠️ Error en db push"

echo "🌱 Ejecutando seed de base de datos..."
npx prisma db seed || echo "⚠️ Seed no ejecutado"

echo "🔧 Generando Prisma Client..."
npx prisma generate

echo "✅ Iniciando servidor Next.js..."
exec node server.js