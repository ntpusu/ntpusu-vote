import prisma from '~/lib/prisma'
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
        include: { VoterInGroup: true },
    })

    if (!voter) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
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
            statusMessage: 'Not Found'
        })
    }

    if (Date.now() <= VS.endTime.getTime()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request'
        })
    }

    if (!groupIds.includes(VS.groupId)) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    return VS
})