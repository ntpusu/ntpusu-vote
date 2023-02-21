import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')
    const res = await $fetch('/api/checkAdmin', {
        method: 'POST',
        body: JSON.stringify({ un: un })
    })

    if (!res.admin) {
        return { data: false }
    }

    const { voteName, startTime, endTime, candidates } = await readBody(_event)

    const VS = await prisma.voteSession.create({
        data: {
            name: voteName,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        }
    })

    for (let i = 0; i < candidates.length; i++) {
        await prisma.candidate.create({
            data: {
                name: candidates[i],
                voteSessionId: VS.id
            }
        })
    }

    return { data: true }
})