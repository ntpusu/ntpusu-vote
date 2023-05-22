import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { votingId, groupId } = getQuery(event) as { votingId: string | undefined, groupId: string | undefined }

    if (!votingId || isNaN(parseInt(votingId)) || !groupId || isNaN(parseInt(groupId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "votingId" and "groupId" are required and must be integer.',
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

    const VFG = await prisma.votingFromGroup.findUniqueOrThrow({
        where: {
            votingId_groupId: {
                votingId: parseInt(votingId),
                groupId: parseInt(groupId),
            }
        },
        select: {
            cnt: true,
            voting: {
                select: {
                    name: true,
                    endTime: true,
                },
            },
            group: {
                select: {
                    name: true,
                },
            },
        },
    })

    if (new Date() <= VFG.voting.endTime) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '投票尚未結束',
        })
    }

    return {
        Vname: VFG.voting.name,
        Gname: VFG.group.name,
        cnt: VFG.cnt
    }
})