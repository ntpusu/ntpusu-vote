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

    // 執行操作
    setResponseStatus(event, 200)
    return await prisma.admin.findMany({
        orderBy: { id: 'asc' }
    })
})
