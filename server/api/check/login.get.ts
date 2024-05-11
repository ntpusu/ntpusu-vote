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

    if (!event.context.isVoter) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是選舉人',
        })
    }

    // 執行操作
    const id = parseInt(event.context.id)
    const login = await prisma.voterLogin.findUnique({
        where: { voterId: id },
        select: {
            id: true,
            time: true,
        },
    })

    setResponseStatus(event, login ? 200 : 201)
    return {
        firstLogin: login === null,
        login: login || await prisma.voterLogin.create({
            data: {
                id: await prisma.voterLogin.count() + 1,
                voterId: id,
            },
            select: {
                id: true,
                time: true,
            },
        }),
    }
})
