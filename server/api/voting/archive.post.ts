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
    const { id } = await readBody(event) as { id: string | undefined }

    if (!id || isNaN(parseInt(id))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "id" is required and should be a number.',
        })
    }

    // 執行操作
    const voting = await prisma.voting.findUniqueOrThrow({
        where: { id: parseInt(id) },
        select: {
            startTime: true,
        },
    })

    if (!event.context.isSuperAdmin) {
        if (Date.now() >= voting.startTime.getTime()) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden',
                message: '投票已開始，不可封存',
            })
        }
    }

    await prisma.voting.update({
        where: { id: parseInt(id) },
        data: { archive: true },
        select: null,
    })

    return {}
})
