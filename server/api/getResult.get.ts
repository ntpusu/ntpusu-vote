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

    const voter = await prisma.voter.findUnique({
        where: { id: parseInt(studentId) },
        include: { VoterInGroup: true },
    })

    if (!voter) {
        throw createError({
            statusCode: 401,
            message: '不在投票人名冊中'
        })
    }

    const { id } = getQuery(event) as { id: string }

    const groupIds = voter.VoterInGroup.map((item) => item.groupId)

    const VS = await prisma.voteSession.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            candidates: {
                include: {
                    ballots: true,
                },
            },
        },
    })

    if (!VS) {
        throw createError({
            statusCode: 404,
            message: 'Not Found'
        })
    }

    if (Date.now() <= VS.endTime.getTime()) {
        throw createError({
            statusCode: 400,
            message: '投票尚未結束'
        })
    }

    if (!groupIds.includes(VS.groupId)) {
        throw createError({
            statusCode: 401,
            message: '沒有查看權限'
        })
    }

    return VS
})