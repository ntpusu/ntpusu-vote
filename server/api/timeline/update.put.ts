import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {

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

    const { id, content, start, end, showEnd, showTime } = await readBody(event) as {
        id: number
        content: string
        start: string
        end: string
        showEnd: boolean
        showTime: boolean
    }

    if (!id || isNaN(id)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'id 不是數字',
        })
    }
    if (!content) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'content 不能為空',
        })
    }
    if (!start) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'start 不能為空',
        })
    }
    if (!end) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'end 不能為空',
        })
    }

    const startDate = new Date(start)
    const endDate = new Date(end)
    
    if (startDate > endDate) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: '開始時間不能晚於結束時間',
        })
    }

    await prisma.votingTimeline.update({
        where: { id },
        data: {
            content,
            start: startDate,
            end: endDate,
            showEnd,
            showTime,
        },
        select: {
            id: true,
        }
    })

    return {}
})