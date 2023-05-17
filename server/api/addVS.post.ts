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
            photo: string | undefined
        }[]
    }

    if (!voteName || !voteGroup || !startTime || !endTime || onlyOne === undefined || !candidates) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request',
        })
    }

    if (onlyOne && candidates.length !== 1) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request',
        })
    }

    if (new Date(startTime) >= new Date(endTime)) {
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
            message: '不在管理員名單中',
        })
    }

    const VS = await prisma.voting.create({
        data: {
            name: voteName,
            groupId: voteGroup,
            startTime,
            endTime,
            onlyOne,
        },
        select: { id: true },
    })

    if (onlyOne) {
        await prisma.candidate.createMany({
            data: [
                {
                    name: candidates[0].name,
                    photo: candidates[0].photo,
                    groupId: voteGroup,
                    votingId: VS.id,
                },
                {
                    name: '同意',
                    groupId: voteGroup,
                    votingId: VS.id,
                },
                {
                    name: '不同意',
                    groupId: voteGroup,
                    votingId: VS.id,
                },
                {
                    name: '廢票',
                    groupId: voteGroup,
                    votingId: VS.id,
                },
            ],
        })
    }
    else {
        await prisma.candidate.createMany({
            data: candidates.map((candidate) => ({
                name: candidate.name,
                photo: candidate.photo && isValidUrl(candidate.photo) ? candidate.photo : undefined,
                groupId: voteGroup,
                votingId: VS.id,
            })).concat([{
                name: '廢票',
                photo: undefined,
                groupId: voteGroup,
                votingId: VS.id,
            }]),
        })
    }

    return {}
})

function isValidUrl(url: string) {
    try {
        new URL(url);
        return true;
    } catch (err) {
        return false;
    }
}