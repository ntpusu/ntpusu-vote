import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { id } = getQuery(event) as { id: string | undefined }

    if (!id || isNaN(parseInt(id))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "id" is required and should be a number.',
        })
    }

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

    if (id == process.env.ADMIN) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '無法刪除超級管理員',
        })
    }

    await prisma.Voter.delete({
        where: { id: parseInt(id) },
        select: null,
    })

    return {}
})