import prisma from '~/lib/prisma'
import SHA256 from 'crypto-js/sha256.js'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            message: '未登入'
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
            message: '不在投票人名冊中'
        })
    }

    const { candidateId, voterId } = await readBody(event)

    if (!candidateId || !voterId) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request'
        })
    }

    if (voterId !== studentId) {
        throw createError({
            statusCode: 401,
            message: '登入者與投票者不符'
        })
    }

    const candidate = await prisma.candidate.findUnique({ where: { id: parseInt(candidateId) } })

    if (!candidate) {
        throw createError({
            statusCode: 404,
            message: 'Not Found'
        })
    }

    const voteSession = await prisma.voteSession.findUnique({ where: { id: candidate.voteSessionId } })

    if (!voteSession) {
        throw createError({
            statusCode: 404,
            message: 'Not Found'
        })
    }

    if (Date.now() < voteSession.startTime.getTime()) {
        throw createError({
            statusCode: 400,
            message: '投票尚未開始'
        })
    }

    if (Date.now() > voteSession.endTime.getTime()) {
        throw createError({
            statusCode: 400,
            message: '投票已結束'
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