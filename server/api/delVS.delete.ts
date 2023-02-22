import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')
    const res = await $fetch('/api/checkAdmin', {
        method: 'POST',
        body: JSON.stringify({ un: un })
    })

    if (res.admin == false) {
        return { data: false }
    }

    const query = getQuery(_event)
    const VSTitle = query.title

    const VS = await prisma.voteSession.findUnique({
        where: { name: VSTitle as string },
    })

    const candidates = await prisma.candidate.findMany({
        where: { voteSessionId: VS!.id },
    })

    for (const candidate of candidates) {
        await prisma.ballot.deleteMany({
            where: { candidateId: candidate.id },
        })
    }

    await prisma.candidate.deleteMany({
        where: { voteSessionId: VS!.id },
    })

    await prisma.voteSession.delete({
        where: { name: VSTitle as string },
    })

    return { data: true }
})