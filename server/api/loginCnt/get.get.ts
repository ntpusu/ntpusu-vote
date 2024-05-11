import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    // 執行操作
    const { startTime, endTime } = getQuery(event) as { startTime: string, endTime: string }

    setResponseStatus(event, 200)
    if (!startTime || isNaN(parseInt(startTime)) || !endTime || isNaN(parseInt(endTime))) {
        return await prisma.voterLogin.count()
    }
    else {
        return await prisma.voterLogin.count({
            where: {
                time: {
                    gte: new Date(parseInt(startTime)),
                    lte: new Date(parseInt(endTime)),
                },
            },
        })
    }
})
