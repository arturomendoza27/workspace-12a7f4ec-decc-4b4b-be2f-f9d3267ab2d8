#!/bin/sh
set -e

echo "🚀 Iniciando FotoGestor..."

echo "⏳ Esperando base de datos..."
sleep 5

echo "📦 Ejecutando migraciones en producción (forzado)..."
if [ -d "prisma/migrations" ]; then
  npx prisma migrate deploy || echo "⚠️ Error ejecutando migrate deploy"
else
  echo "⚠️ No existe carpeta prisma/migrations"
fi

echo "🔧 Generando Prisma Client..."
npx prisma generate || echo "⚠️ Error generando prisma client"

echo "🚀 Iniciando servidor Next.js..."
exec node server.js