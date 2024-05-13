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

    if (!event.context.isSuperAdmin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是超級管理員',
        })
    }

    // 確認參數
    const { id } = getQuery(event) as { id: string | undefined }

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
        select: { archive: true },
    })

    if (!voting.archive) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '投票尚未封存',
        })
    }

    await prisma.voting.delete({
        where: { id: parseInt(id) },
        select: null,
    })

    return {}
})
