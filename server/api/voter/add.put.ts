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
    const { id, department } = getQuery(event) as {
        id: string | undefined,
        department: string | undefined,
    }

    if (!id || isNaN(parseInt(id))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "id" is required and must be a number.',
        })
    }

    // 執行操作
    const {
        id: departmentId,
    } = await prisma.department.findUniqueOrThrow({
        where: {
            name: department,
        },
        select: {
            id: true,
        },
    }).catch(()=>{
        throw createError({
            message: `${department} 不在資料庫中`,
        })
    })

    // 執行操作
    const voter = await prisma.voter.create({
        data: {
            id: parseInt(id),
            departmentId: departmentId,
        },
    })

    setResponseStatus(event, 201)
    return voter.id
})
