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
    const studentId = email.substring(1, 10)

    const admin = await prisma.admin.findUnique({
        where: { id: parseInt(studentId) },
    })

    if (!admin) {
        throw createError({
            statusCode: 401,
            message: '不在管理員名單中'
        })
    }

    const { voteName, voteGroup, startTime, endTime, candidates } = await readBody(event)

    if (!voteName || !voteGroup || !startTime || !endTime || !candidates) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request'
        })
    }

    const VS = await prisma.voteSession.create({
        data: {
            name: voteName,
            groupId: voteGroup,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        }
    })

    for (const candidate of candidates) {
        await prisma.candidate.create({
            data: {
                name: candidate,
                voteSessionId: VS.id
            }
        })
    }

    return true
})