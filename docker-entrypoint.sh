#!/bin/sh
set -e

echo "🚀 Iniciando FotoGestor..."

echo "📁 Preparando carpeta SQLite..."
mkdir -p /app/db

echo "🔧 Generando Prisma Client (local)..."
./node_modules/.bin/prisma generate

echo "🧱 Aplicando schema a SQLite..."
./node_modules/.bin/prisma db push --accept-data-loss

echo "🌱 Ejecutando seed..."
./node_modules/.bin/prisma db seed || echo "⚠️ Seed no configurado"

echo "✅ Iniciando servidor..."
exec node server.js