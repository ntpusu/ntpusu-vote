import prisma from '~/lib/prisma'

export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const login = await $fetch('/api/checkLogin', { method: 'POST', body: JSON.stringify({ un: un }) }) as any

    if (!login.result) {
        return undefined
    }

    const vote = await prisma.voteSession.findMany({
        cacheStrategy: { ttl: 15, swr: 3600 },
        include: { candidates: true },
    })
    return vote
})