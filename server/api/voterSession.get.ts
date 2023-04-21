import prisma from '~/lib/prisma'
import HS256 from 'crypto-js/hmac-sha256'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            message: '未登入'
        })
    }

    const email = session.user.email
    const studentId = parseInt(email.substring(1, 10))

    const voter = await prisma.voter.findUnique({
        where: { id: studentId },
        select: {
            VoterInGroup: {
                select: {
                    groupId: true,
                }
            },
        }
    })

    if (!voter) {
        throw createError({
            statusCode: 401,
            message: '不在投票人名冊中'
        })
    }

    const groupIds = voter.VoterInGroup.map((item) => item.groupId)

    const VS = await prisma.voteSession.findMany({
        where: {
            groupId: {
                in: groupIds,
            },
        },
        select: {
            id: true, name: true, startTime: true, endTime: true,
            candidates: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    })

    const tokens: string[] = []
    for (const VSitem of VS) {
        const token = HS256(studentId.toString() + VSitem.id.toString() + VSitem.name, process.env.AUTH_SECRET as string).toString()
        const ballot = await prisma.ballot.findUnique({
            where: { token, },
            select: null,
        })

        if (ballot) {
            tokens[VSitem.id] = token
        }
    }

    return {
        VS,
        tokens,
    }
})
