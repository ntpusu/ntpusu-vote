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
    const { voter } = getQuery(event) as { voter: string | undefined }
    if (!voter || !/^\d{8,9}$/.test(voter)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "voter" is required and must be a number',
        })
    }

    // 執行操作
    const id = parseInt(voter)
    const item = await prisma.voter.findUniqueOrThrow({
        where: { id },
        select: {
            login: {
                select: {
                    id: true,
                    time: true,
                },
            },
            department: {
                select: {
                    departmentInGroup: {
                        select: {
                            group: {
                                select: {
                                    name: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    })

    let group = ''
    for (const i of item.department.departmentInGroup) {
        group += i.group.name + ', '
    }

    group = group.slice(0, -2)

    setResponseStatus(event, 200)
    return {
        id,
        group,
        first: {
            serNum: item.login?.id,
            time: item.login?.time,
        },
    }
})
