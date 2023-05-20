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
    const id = parseInt(email.substring(1, 10))

    let login = await prisma.voterLogin.findUnique({
        where: { voterId: id },
        select: {
            id: true,
            time: true,
        },
    })

    if (!login) {
        login = await prisma.voterLogin.create({
            data: { voterId: id },
            select: {
                id: true,
                time: true,
            },
        })

        return {
            firstLogin: true,
            login,
        }
    }

    return {
        firstLogin: false,
        login,
    }
})