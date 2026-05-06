import 'dotenv/config'
import { defineConfig } from 'prisma/config'

const datasourceUrl
  = process.env.DATABASE_URL
    ?? process.env.POSTGRES_URL_NON_POOLING
    ?? process.env.POSTGRES_PRISMA_URL

if (!datasourceUrl) {
  throw new Error(
    'Prisma requires DATABASE_URL, POSTGRES_URL_NON_POOLING, or POSTGRES_PRISMA_URL.',
  )
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: datasourceUrl,
  },
})
