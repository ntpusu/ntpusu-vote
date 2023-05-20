import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { id } = await readBody(event) as { id: string | undefined }

    if (!id || isNaN(parseInt(id))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "id" is required and should be a number',
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

    const admin = await prisma.admin.findUnique({
        where: { id: parseInt(studentId) },
        select: null,
    })

    if (!admin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不在管理員名單中',
        })
    }

    const VS = await prisma.voting.findUniqueOrThrow({
        where: { id: parseInt(id) },
        select: {
            startTime: true,
        },
    })

    if (studentId != process.env.ADMIN) {
        if (Date.now() >= VS.startTime.getTime()) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden',
                message: '投票已開始，不可封存',
            })
        }
    }

    await prisma.voting.update({
        where: { id: parseInt(id) },
        data: { archive: true },
        select: null,
    })

    return {}
})