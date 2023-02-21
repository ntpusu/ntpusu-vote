import prisma from '~/lib/prisma'

export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const login = await $fetch('/api/checkLogin', { method: 'POST', body: JSON.stringify({ un: un }) })

    if (!login.result) {
        return undefined
    }

    const res = await $fetch('/api/checkAdmin', { method: 'POST', body: JSON.stringify({ un: un }) })

    if (res.admin) {
        return await prisma.voteSession.findMany({
            include: { candidates: true },
        })
    } else {
        return await prisma.voteSession.findMany({
            cacheStrategy: { ttl: 60 * 60, swr: 60 * 60 * 23 },
            include: { candidates: true },
        })
    }
})