import prisma from '~/lib/prisma'

export default defineEventHandler(async (_event) => {
    const voteSession = await prisma.voteSession.findMany()
    return voteSession
})