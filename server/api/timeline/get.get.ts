import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    const { getLotteryTime } = getQuery(event)
    if (getLotteryTime) {
        const timelines =  await prisma.votingTimeline.findFirst({
            where: {
                isLotteryTime: true
            },
            orderBy: {
                start: 'asc',
            }
        })
        if (!timelines) {
            return "(無抽獎)"
        }
        const timeString =
        timelines.start.getMonth()+1 +"月"+ timelines.start.getDate()+ "日" + " " + timelines.start.getHours() + ":" + String(timelines.start.getMinutes()).padStart(2, '0') +
        " 至 " + timelines.end.getMonth()+1 +"月"+ timelines.end.getDate()+ "日" + " " + timelines.end.getHours() + ":" + String(timelines.end.getMinutes()).padStart(2, '0')
        return timeString
    }
    return await prisma.votingTimeline.findMany({
        orderBy: {
            start: 'asc',
        }
    })
})
