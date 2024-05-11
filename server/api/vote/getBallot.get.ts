import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    // 確認權限
    if (!event.context.session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    if (!event.context.isAdmin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是管理員',
        })
    }

    // 確認參數
    const { token } = getQuery(event) as { token: string | undefined }
    if (!token) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "token" is required.',
        })
    }

    // 執行操作
    const ballot = await prisma.ballot.findUniqueOrThrow({
        where: { token },
        select: {
            time: true,
            candidate: {
                select: {
                    name: true,
                    voting: {
                        select: {
                            name: true,
                            endTime: true,
                        },
                    },
                },
            },
        },
    })

    if (new Date() <= ballot.candidate.voting.endTime) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '投票尚未結束',
        })
    }

    setResponseStatus(event, 200)
    return {
        vote: ballot.candidate.voting.name,
        candidate: ballot.candidate.name,
        time: ballot.time,
    }
})
