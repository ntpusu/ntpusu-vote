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

    // 執行操作
    return await prisma.voting.findMany({
        select: {
            id: true,
            name: true,
            startTime: true,
            endTime: true,
            archive: true,
            group: {
                select: {
                    name: true,
                },
            },
        },
    })
})
