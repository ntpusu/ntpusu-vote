import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { token } = getQuery(event) as { token: string | undefined }

    if (!token) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "token" is required.',
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
            message: '不在管理員名單中'
        })
    }

    const ballot = await prisma.ballot.findUniqueOrThrow({
        where: { token },
        select: {
            time: true,
            candidate: {
                select: {
                    name: true,
                    voting: {
                        select: {
                            name: true,
                            endTime: true,
                        },
                    },
                },
            },
        },
    })

    if (new Date() <= ballot.candidate.voting.endTime) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '投票尚未結束',
        })
    }

    return {
        vote: ballot.candidate.voting.name,
        candidate: ballot.candidate.name,
        time: ballot.time,
    }
})