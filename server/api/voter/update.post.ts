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
    const { voterId, voterDepartment } = await readBody(event) as {
        voterId: number
        voterDepartment: string
    }

    const {
        id: DepartmentId,
    } = await prisma.department.findUniqueOrThrow({
        where: { name: voterDepartment, },
        select: {
            id: true
        }
    }).catch(() => {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: `${voterDepartment} 不在資料庫中`
        })
    })

    await prisma.voter.update({
        where: {
            id: voterId,
        },
        data: {
            departmentId: DepartmentId
        }
    })

    setResponseStatus(event, 204)
    return null
})
