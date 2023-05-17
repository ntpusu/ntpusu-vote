import prisma from '~/lib/prisma'
import HS256 from 'crypto-js/hmac-sha256.js'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { VSId, cname } = await readBody(event) as {
        VSId: string | undefined
        cname: string | undefined
    }

    if (!VSId || isNaN(parseInt(VSId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter VSId is required and must be a number',
        })
    }

    if (!cname) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter cname is required',
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
            message: '不在投票人名冊中',
        })
    }

    const candidate = await prisma.candidate.findUnique({
        where: { votingId_name: { votingId: parseInt(VSId), name: cname } },
        select: { votingId: true },
    })

    if (!candidate) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'candidate Not Found',
        })
    }

    if (candidate.votingId != parseInt(VSId)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Candidate Not In Voting',
        })
    }

    const voting = await prisma.voting.findUnique({
        where: { id: parseInt(VSId) },
        select: {
            startTime: true,
            endTime: true,
            archive: true,
            groupId: true,
        },
    })

    if (!voting) {
        throw createError({
            statusCode: 404,
            statusMessage: 'Not Found',
            message: 'Voting Not Found',
        })
    }

    if (voting.archive) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '投票已被封存',
        })
    }

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

    const token = HS256(studentId.toString() + VSId.toString(), process.env.AUTH_SECRET as string).toString()

    try {
        await prisma.ballot.create({
            data: { token, votingId: parseInt(VSId), candidateName: cname, validation: Math.floor(Math.random() * 1000000).toString().padStart(6, '0') },
            select: null,
        })
    }
    catch (e) {
        return { vote: false, token }
    }

    return { vote: true, token }
})