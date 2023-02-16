import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')
    const query = getQuery(_event)
    const id = query.id

    if (un === undefined || un === null) {
        return false
    }

    const login = await $fetch('/api/checkLogin', { method: 'POST', body: JSON.stringify({ un: un }) }) as any

    if (!login.result) {
        return false
    }

    const voteSession = await prisma.voteSession.findUnique({
        where: { id: parseInt(id as string) },
        include: {
            candidates:
                { include: { ballots: true } }
        },
    })

    return voteSession
})