import { PrismaClient } from '@prisma/client'

// Función para crear una nueva instancia de Prisma cada vez
function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

// Crear una nueva instancia cada vez para evitar prepared statements
export const prisma = createPrismaClient()

// Desconectar al finalizar
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export default prisma