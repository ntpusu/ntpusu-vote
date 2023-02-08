import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const query = getQuery(_event)
    const id = query.id

    const candidate = await prisma.candidate.findUnique({
        where: { id: parseInt(id as string) },
    })

    return candidate
})