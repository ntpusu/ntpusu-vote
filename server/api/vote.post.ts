import prisma from '~/lib/prisma'
import HS256 from 'crypto-js/hmac-sha256.js'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { votingId, cname } = await readBody(event) as {
        votingId: string | undefined
        cname: string | undefined
    }

    if (!votingId || isNaN(parseInt(votingId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "votingId" is required and must be a number.',
        })
    }

    if (!cname) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "cname" is required.',
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
        select: {
            department: {
                select: {
                    departmentInGroup: {
                        select: {
                            groupId: true,
                        },
                    },
                },
            },
        },
    })

    if (!voter) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不在選舉人名單中',
        })
    }

    await prisma.candidate.findUniqueOrThrow({
        where: { votingId_name: { votingId: parseInt(votingId), name: cname } },
        select: null,
    })

    const voting = await prisma.voting.findUniqueOrThrow({
        where: { id: parseInt(votingId) },
        select: {
            startTime: true,
            endTime: true,
            archive: true,
            groupId: true,
        },
    })

    if (voting.archive) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '投票已被封存',
        })
    }

    const voterGroups = voter.department.departmentInGroup.map(v => v.groupId)

    if (!voterGroups.includes(voting.groupId)) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '沒有投票權',
        })
    }

    if (Date.now() < voting.startTime.getTime()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: '投票尚未開始',
        })
    }

    if (Date.now() > voting.endTime.getTime()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: '投票已結束',
        })
    }

    const token = HS256(studentId.toString() + votingId.toString(), process.env.AUTH_SECRET as string).toString()

    try {
        await prisma.$transaction([
            prisma.ballot.create({
                data: { token, votingId: parseInt(votingId), candidateName: cname },
                select: null,
            }),
            prisma.votingFromGroup.updateMany({
                where: {
                    votingId: parseInt(votingId),
                    groupId: {
                        in: voterGroups,
                    },
                },
                data: { cnt: { increment: 1 } },
            }),
        ])
    }
    catch (e) {
        return { vote: false, token }
    }

    return { vote: true, token }
})
