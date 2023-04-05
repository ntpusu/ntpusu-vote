import prisma from '~/lib/prisma'
import SHA256 from 'crypto-js/sha256.js'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const email = session['user']['email']
    const studentId = email.substring(1, 10)

    const voter = await prisma.voter.findUnique({
        where: { id: parseInt(studentId) },
    })

    if (!voter) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const { id } = getQuery(event) as { id: string }

    const voteSession = await prisma.voteSession.findUnique({ where: { id: parseInt(id) } })

    if (!voteSession) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found'
        })
    }

    const token = SHA256(studentId + voteSession.name + process.env.AUTH_SECRET).toString()

    return await prisma.ballot.findUnique({ where: { token }, include: { candidate: true } })
})