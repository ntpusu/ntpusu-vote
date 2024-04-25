import prisma from '~/lib/prisma'

export default defineEventHandler(async () => {
    const timeLine = await prisma.votingTimeLine.findMany({
        orderBy: {
            start: 'asc',
        }
    })
    const result: Activity[] = []

    for(const time of timeLine) {
        const data: Activity = {
            content: time.content,
            start: time.start,
            end: time.end,
            finish: time.finish,
            maybe: time.maybe
        }
        result.push(data);
    }
    return result
})

interface Activity {
    content: string,
    start: Date,
    end: Date,
    finish: Date,
    maybe: boolean,
}