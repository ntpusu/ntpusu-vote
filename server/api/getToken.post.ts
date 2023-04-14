import prisma from '~/lib/prisma'
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

    const admin = await prisma.admin.findUnique({
        where: { id: parseInt(studentId) },
    })

    if (!admin) {
        throw createError({
            statusCode: 401,
            message: '不在管理員名單中'
        })
    }

    const { token } = await readBody(event)

    if (!token) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request'
        })
    }

    const ballot = await prisma.ballot.findUnique({
        where: { token: token },
    })

    if (!ballot) {
        throw createError({
            statusCode: 404,
            message: '找不到該票'
        })
    }

    const candidate = await prisma.candidate.findUnique({
        where: { id: ballot.candidateId },
    })

    if (!candidate) {
        throw createError({
            statusCode: 404,
            message: '找不到該候選人'
        })
    }

    const vote = await prisma.voteSession.findUnique({
        where: { id: candidate.voteSessionId },
    })

    if (!vote) {
        throw createError({
            statusCode: 404,
            message: '找不到該投票'
        })
    }

    return {
        vote: vote.name,
        candidate: candidate.name,
        time: ballot.time,
    }
})