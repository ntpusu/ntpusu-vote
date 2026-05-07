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

    const { id } = getQuery(event) as { id: string | undefined }
    const superAdminId = Number(id)

    if (!id || !Number.isInteger(superAdminId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "id" is required and must be a number.',
        })
    }

    const superAdminCount = await prisma.superAdmin.count()

    if (superAdminCount <= 1) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: '至少保留一位超級管理員',
        })
    }

    await prisma.superAdmin.delete({
        where: { id: superAdminId },
        select: null,
    })

    setResponseStatus(event, 204)
    return null
})
