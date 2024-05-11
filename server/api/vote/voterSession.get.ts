import prisma from '~/lib/prisma'
import HS1 from 'crypto-js/hmac-sha1.js'
export default defineEventHandler(async (event) => {
    // 確認權限
    if (!event.context.session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    if (!event.context.isVoter) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是選舉人',
        })
    }

    // 執行操作
    const id = parseInt(event.context.id)
    const voter = await prisma.voter.findUniqueOrThrow({
        where: { id },
        select: {
            department: {
                select: {
                    departmentInGroup: {
                        select: {
                            groupId: true,
                        },
                    },
                },
            },
        },
    })

    const groupIds = voter.department.departmentInGroup.map((item) => item.groupId)

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
        const token = HS1(id.toString() + votingItem.id.toString(), process.env.AUTH_SECRET as string).toString()

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
