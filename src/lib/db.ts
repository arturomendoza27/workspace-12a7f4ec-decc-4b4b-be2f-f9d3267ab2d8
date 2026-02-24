import { PrismaClient } from '@prisma/client'

// Forzar nueva instancia de PrismaClient - actualizado 2024
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Siempre crear nueva instancia en desarrollo para evitar cache de esquema
export const db = new PrismaClient({
  log: ['query'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
