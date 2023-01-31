import prisma from '~/lib/prisma'

export default defineEventHandler(async (_event) => {
    const candidate = await prisma.candidate.findMany()
    return candidate
})