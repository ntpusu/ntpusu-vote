import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { voteName, voteGroup, startTime, endTime, onlyOne, candidates } = await readBody(event) as {
        voteName: string
        voteGroup: number | undefined
        startTime: string
        endTime: string
        onlyOne: boolean
        candidates: {
            name: string
        }[]
    }

    if (!voteName || typeof voteGroup === 'undefined' || !startTime || !endTime || onlyOne === undefined || !candidates) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameters are not enough.',
        })
    }

    if (onlyOne && candidates.length !== 1) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Candidate length should be 1 when onlyOne is true.',
        })
    }

    if (new Date(startTime) >= new Date(endTime)) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'StartTime should be earlier than endTime.',
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
            message: '不在管理員名單中',
        })
    }

    const voting = await prisma.voting.create({
        data: {
            name: voteName,
            groupId: voteGroup,
            startTime,
            endTime,
            onlyOne,
        },
        select: { id: true },
    })

    const groups = await prisma.group.findMany({
        select: { id: true },
    })

    await prisma.votingFromGroup.createMany({
        data: groups.map((group) => ({
            votingId: voting.id,
            groupId: group.id,
        })),
    })

    if (onlyOne) {
        await prisma.candidate.createMany({
            data: [
                {
                    name: candidates[0].name,
                    groupId: voteGroup,
                    votingId: voting.id,
                },
                {
                    name: '同意',
                    groupId: voteGroup,
                    votingId: voting.id,
                },
                {
                    name: '不同意',
                    groupId: voteGroup,
                    votingId: voting.id,
                },
                {
                    name: '廢票',
                    groupId: voteGroup,
                    votingId: voting.id,
                },
            ],
        })
    }
    else {
        await prisma.candidate.createMany({
            data: candidates.map((candidate) => ({
                name: candidate.name,
                groupId: voteGroup,
                votingId: voting.id,
            })).concat([{
                name: '廢票',
                groupId: voteGroup,
                votingId: voting.id,
            }]),
        })
    }

    return {}
})
