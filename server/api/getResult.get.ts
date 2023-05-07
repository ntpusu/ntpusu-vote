import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { id } = getQuery(event) as { id: string | undefined }

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request'
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

    const voter = await prisma.voter.findUnique({
        where: { id: studentId },
        select: null,
    })

    if (!voter) {
        throw createError({
            statusCode: 401,
            message: '不在投票人名冊中',
        })
    }

    const VS = await prisma.voting.findUnique({
        where: { id: parseInt(id) },
        select: {
            endTime: true,
            groupId: true,
        },
    })

    if (!VS) {
        throw createError({
            statusCode: 404,
            message: 'Not Found',
        })
    }

    if (Date.now() <= VS.endTime.getTime()) {
        throw createError({
            statusCode: 400,
            message: '投票尚未結束',
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
                    groupId: VS.groupId,
                },
            },
            select: null,
        })

        if (!VIG) {
            throw createError({
                statusCode: 401,
                message: '沒有查看權限',
            })
        }
    }

    return await prisma.voting.findUnique({
        where: {
            id: parseInt(id),
        },
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
                    id: 'asc',
                },
            },
        },
    })
})