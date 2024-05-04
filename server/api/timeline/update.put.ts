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