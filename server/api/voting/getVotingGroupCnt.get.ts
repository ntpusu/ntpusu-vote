import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    // 確認權限
    if (!event.context.session) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Unauthorized',
            message: '未登入',
        })
    }

    if (!event.context.isAdmin) {
        throw createError({
            statusCode: 403,
            statusMessage: 'Forbidden',
            message: '不是管理員',
        })
    }

    // 確認參數
    const { votingId, groupId } = getQuery(event) as { votingId: string | undefined, groupId: string | undefined }

    if (!votingId || isNaN(parseInt(votingId)) || !groupId || isNaN(parseInt(groupId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "votingId" and "groupId" are required and must be integer.',
        })
    }

    // 執行操作
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
