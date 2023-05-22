import prisma from '~/lib/prisma'
import HS256 from 'crypto-js/hmac-sha256.js'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    const email = session.user.email
    const studentId = parseInt(email.substring(1, 10))

    const voter = await prisma.voter.findUnique({
        where: { id: studentId },
        select: {
            voterInGroup: {
                select: {
                    groupId: true,
                },
            },
        },
    })

    if (!voter) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不在選舉人名單中',
        })
    }

    const groupIds = voter.voterInGroup.map((item) => item.groupId)

    const voting = await prisma.voting.findMany({
        where: {
            archive: false,
            groupId: {
                in: groupIds,
            },
        },
        select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            onlyOne: true,
            candidates: {
                select: {
                    name: true,
                },
            },
        },
        orderBy: {
            id: 'asc',
        },
    })

    const tokens: string[] = []
    for (const votingItem of voting) {
        const token = HS256(studentId.toString() + votingItem.id.toString(), process.env.AUTH_SECRET as string).toString()

        const ballot = await prisma.ballot.findUnique({
            where: { token },
            select: null,
        })

        if (ballot) {
            tokens[votingItem.id] = token
        }
    }

    return {
        voting,
        tokens,
    }
})
