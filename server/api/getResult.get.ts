import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { id } = getQuery(event) as { id: string | undefined }

    if (!id || isNaN(parseInt(id))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "id" is required and must be a number.',
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

    const voter = await prisma.voter.findUnique({
        where: { id: studentId },
        select: null,
    })

    if (!voter) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不在選舉人名單中',
        })
    }

    const voting = await prisma.voting.findUniqueOrThrow({
        where: { id: parseInt(id) },
        select: {
            endTime: true,
            groupId: true,
            archive: true,
        },
    })

    if (Date.now() <= voting.endTime.getTime()) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '投票尚未結束',
        })
    }

    if (voting.archive) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '投票已被封存',
        })
    }

    const admin = await prisma.admin.findUnique({
        where: { id: studentId },
        select: null,
    })

    if (!admin) {
        const VIG = await prisma.voterInGroup.findUnique({
            where: {
                voterId_groupId: {
                    voterId: studentId,
                    groupId: voting.groupId,
                },
            },
            select: null,
        })

        if (!VIG) {
            throw createError({
                statusCode: 403,
                statusMessage: 'Forbidden',
                message: '沒有查看權限',
            })
        }
    }

    return await prisma.voting.findUniqueOrThrow({
        where: { id: parseInt(id) },
        select: {
            name: true,
            startTime: true,
            endTime: true,
            onlyOne: true,
            candidates: {
                select: {
                    name: true,
                    _count: {
                        select: {
                            ballots: true,
                        },
                    },
                },
                orderBy: {
                    ballots: {
                        _count: 'desc',
                    },
                },
            },
        },
    })
})