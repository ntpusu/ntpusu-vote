import prisma from '~/lib/prisma'

export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const login = await $fetch('/api/checkLogin', { method: 'POST', body: JSON.stringify({ un: un }) }) as any

    if (!login.result) {
        return false
    }

    const vote = await prisma.voteSession.findMany({
        include: { candidates: true },
    })
    return vote
})