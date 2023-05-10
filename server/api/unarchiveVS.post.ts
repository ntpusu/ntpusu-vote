import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { id } = await readBody(event) as { id: string | undefined }

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request',
        })
    }

    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
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
            statusCode: 401,
            message: '不在管理員名單中',
        })
    }

    await prisma.voting.update({
        where: { id: parseInt(id) },
        data: { delete: false },
        select: null,
    })

    return {}
})