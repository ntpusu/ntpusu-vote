import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {

    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    const email = session.user.email
    const studentId = parseInt(email.substring(1, 10))

    const admin = await prisma.admin.findUnique({
        where: { id: studentId },
        select: null,
    })

    if (!admin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不在管理員名單中',
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

    if (isNaN(id)) {
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

    await prisma.votingTimeline.update({
        where: { id },
        data: {
            content,
            start: new Date(start),
            end: new Date(end),
            showEnd,
            showTime,
        }
    })

    return {}
})