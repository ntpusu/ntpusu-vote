import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { token } = await readBody(event) as { token: string | undefined }

    if (!token) {
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
    const studentId = parseInt(email.substring(1, 10))

    const admin = await prisma.admin.findUnique({
        where: { id: studentId },
        select: null,
    })

    if (!admin) {
        throw createError({
            statusCode: 401,
            message: '不在管理員名單中'
        })
    }

    const ballot = await prisma.ballot.findUnique({
        where: { token },
        select: {
            time: true,
            candidate: {
                select: {
                    name: true,
                    voting: {
                        select: {
                            name: true,
                            archive: true,
                        },
                    },
                },
            },
        },
    })

    if (!ballot) {
        throw createError({
            statusCode: 404,
            message: '找不到該票'
        })
    }

    if (ballot.candidate.voting.archive) {
        throw createError({
            statusCode: 401,
            message: '投票已被封存'
        })
    }

    return {
        vote: ballot.candidate.voting.name,
        candidate: ballot.candidate.name,
        time: ballot.time,
    }
})