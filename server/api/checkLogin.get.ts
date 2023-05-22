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

    const voter = await prisma.voter.findUnique({
        where: { id },
        select: null,
    })

    if (!voter) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不在選舉人名單中',
        })
    }

    let login = await prisma.voterLogin.findUnique({
        where: { voterId: id },
        select: {
            id: true,
            time: true,
        },
    })

    if (!login) {
        login = await prisma.voterLogin.create({
            data: {
                id: await prisma.voterLogin.count() + 1,
                voterId: id,
            },
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