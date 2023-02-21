import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const query = getQuery(_event)
    const id = query.id

    const voteSession = await prisma.voteSession.findUnique({
        cacheStrategy: { ttl: 60 * 60 * 24 * 7 },
        where: { id: parseInt(id as string) },
    })

    return voteSession
})