import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const email = session['user']['email']
    const studentId = email.substring(1, 10)

    if (studentId != process.env.ADMIN) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized'
        })
    }

    const { id } = getQuery(event) as { id: string }

    return await prisma.admin.upsert({
        where: { id: parseInt(id) },
        update: {},
        create: { id: parseInt(id) }
    })
})