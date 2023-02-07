import prisma from '~~/lib/prisma'

export default defineEventHandler(async (_event) => {
    const vote = await prisma.voteSession.findMany({
        where: { electionId: null },
        include: { candidates: true },
    })
    return vote
})