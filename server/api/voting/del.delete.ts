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
    const studentId = email.substring(1, 10)

    if (studentId != process.env.SUPER_ADMIN) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是超級管理員',
        })
    }

    const voting = await prisma.voting.findUniqueOrThrow({
        where: { id: parseInt(id) },
        select: { archive: true },
    })

    if (!voting.archive) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '投票尚未封存',
        })
    }

    await prisma.voting.delete({
        where: { id: parseInt(id) },
        select: null,
    })

    return {}
})
