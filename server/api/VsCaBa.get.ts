import prisma from '~~/lib/prisma'

export default defineEventHandler(async (_event) => {
    const vote = await prisma.voteSession.findMany({
        include: {
            candidates: {
                include: { votes: true }
            }
        },
    })
    return vote
})