import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Only create Prisma client if DATABASE_URL is available
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not found, Prisma client not initialized')
    return null
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  })
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma
}

export default prisma