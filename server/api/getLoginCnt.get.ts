import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    const { startTime, endTime } = getQuery(event) as { startTime: string, endTime: string }

    if (!startTime || isNaN(parseInt(startTime)) || !endTime || isNaN(parseInt(endTime))) {
        return await prisma.voterLogin.count()
    }
    else {
        return await prisma.voterLogin.count({
            where: {
                time: {
                    gte: new Date(parseInt(startTime)),
                    lt: new Date(parseInt(endTime)),
                },
            },
        })
    }
})