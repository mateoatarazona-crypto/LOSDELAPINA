import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

// Crear una nueva instancia cada vez para evitar prepared statements
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

// Desconectar al finalizar para limpiar prepared statements
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma