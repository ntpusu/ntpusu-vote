import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '~/generated/prisma/client'

const connectionString
  = process.env.DATABASE_URL
    ?? process.env.POSTGRES_URL_NON_POOLING
    ?? process.env.POSTGRES_PRISMA_URL

if (!connectionString) {
  throw new Error(
    'Prisma requires DATABASE_URL, POSTGRES_URL_NON_POOLING, or POSTGRES_PRISMA_URL.',
  )
}

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
  prismaAdapter?: PrismaPg
}

const adapter = globalForPrisma.prismaAdapter ?? new PrismaPg({ connectionString })
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.prismaAdapter = adapter
}

export default prisma
