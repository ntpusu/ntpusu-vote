import prisma from '~/lib/prisma'

export default defineEventHandler(async (event) => {
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

    setResponseStatus(event, 200)
    return await prisma.superAdmin.findMany({
        orderBy: { id: 'asc' },
    })
})
