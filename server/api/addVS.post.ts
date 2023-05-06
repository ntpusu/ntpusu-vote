import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        throw createError({
            statusCode: 401,
            message: '未登入'
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

    const { voteName, voteGroup, startTime, endTime, candidates } = await readBody(event) as {
        voteName: string;
        voteGroup: number | undefined;
        startTime: string;
        endTime: string;
        candidates: string | string[];
    }

    if (!voteName || !voteGroup || !startTime || !endTime || !candidates) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request'
        })
    }

    const VS = await prisma.voting.create({
        data: {
            name: voteName,
            groupId: voteGroup,
            startTime,
            endTime,
            onlyOne: typeof candidates === 'string' ? candidates : null,
        },
        select: {
            id: true,
        }
    })

    if (typeof candidates === 'string') {
        await prisma.candidate.createMany({
            data: [
                {
                    name: '同意',
                    votingId: VS.id
                },
                {
                    name: '不同意',
                    votingId: VS.id
                },
                {
                    name: '廢票',
                    votingId: VS.id
                }
            ]
        })
    }
    else {
        for (const candidate of candidates) {
            await prisma.candidate.create({
                data: {
                    name: candidate,
                    votingId: VS.id
                }
            })
        }

        await prisma.candidate.create({
            data: {
                name: '廢票',
                votingId: VS.id
            }
        })
    }

    return {}
})