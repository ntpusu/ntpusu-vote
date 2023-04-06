import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'

export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: '未登入'
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
            statusMessage: '不在投票人名冊中'
        })
    }

    const groupIds = voter.VoterInGroup.map((item) => item.groupId)

    const VS = await prisma.voteSession.findMany({
        where: {
            groupId: {
                in: groupIds,
            },
        },
        include: {
            candidates: true,
        },
    })

    return VS
})