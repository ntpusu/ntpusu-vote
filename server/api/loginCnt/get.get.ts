import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    // 執行操作
    const { inLotteryTime } = getQuery(event)

    setResponseStatus(event, 200)
    if (inLotteryTime !== 'true') {
        return await prisma.voterLogin.count()
    }

    const lotteryTimeline = await prisma.votingTimeline.findFirst({
        where: {
            isLotteryTime: true,
        },
        orderBy: {
            start: 'asc',
        },
        select: {
            start: true,
            end: true,
        },
    })

    if (!lotteryTimeline) {
        return 0
    }

    return await prisma.voterLogin.count({
        where: {
            time: {
                gte: lotteryTimeline.start,
                lte: lotteryTimeline.end,
            },
        },
    })
})
