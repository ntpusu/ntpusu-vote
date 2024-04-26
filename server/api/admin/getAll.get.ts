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
    const studentId = email.substring(1, 10)

    if (studentId != process.env.ADMIN) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是超級管理員',
        })
    }

    return await prisma.admin.findMany({
        orderBy: { id: 'asc' }
    })
})
