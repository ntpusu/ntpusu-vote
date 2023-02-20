import prisma from '~/lib/prisma'

export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const login = await $fetch('/api/checkLogin', { method: 'POST', body: JSON.stringify({ un: un }) }) as any

    if (!login.result) {
        return undefined
    }

    const admin = await $fetch('/api/checkAdmin', { method: 'POST', body: JSON.stringify({ un: un }) }) as any

    if (admin.result) {
        return await prisma.voteSession.findMany({
            include: { candidates: true },
        })
    } else {
        return await prisma.voteSession.findMany({
            cacheStrategy: { swr: 60 * 60 * 24 },
            include: { candidates: true },
        })
    }
})