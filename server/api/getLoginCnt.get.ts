import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    const { startTime, endTime } = getQuery(event) as { startTime: string, endTime: string }

    if (!startTime || !endTime) {
        return await prisma.voterLogin.count()
    }
    else {
        return await prisma.voterLogin.count({
            where: {
                time: {
                    gte: new Date(startTime),
                    lt: new Date(endTime),
                },
            },
        })
    }
})