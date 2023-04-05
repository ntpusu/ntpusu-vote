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

    const { candidateId } = await readBody(event)

    if (!candidateId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request'
        })
    }

    const candidate = await prisma.candidate.findUnique({ where: { id: parseInt(candidateId) } })

    if (!candidate) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found'
        })
    }

    const voteSession = await prisma.voteSession.findUnique({ where: { id: candidate.voteSessionId } })

    if (!voteSession) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found'
        })
    }

    if (Date.now() < voteSession.startTime.getTime() || Date.now() > voteSession.endTime.getTime()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request'
        })
    }

    const token = SHA256(studentId + voteSession.name + process.env.AUTH_SECRET).toString()

    try {
        await prisma.ballot.create({
            data: { token, candidateId: parseInt(candidateId) }
        })
    }
    catch (e) {
        return { vote: false, token }
    }

    return { vote: true, token }
})