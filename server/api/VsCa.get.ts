import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const res = await $fetch('/api/checkLogin', { method: 'POST', body: JSON.stringify({ un: un }) })

    if (!res.login) {
        return undefined
    }

    const VS = await prisma.voteSession.findMany()

    for (const VSitem of VS) {
        if (VSitem.electionId.length == 0 && new Date(VSitem.endTime).getTime() < Date.now()) {
            const candidates = await prisma.candidate.findMany({
                where: { voteSessionId: VSitem.id },
                include: { ballots: true },
            })

            let winners: number[] = []
            let max = 0
            for (const candidate of candidates) {
                if (candidate.ballots.length > max) {
                    winners = [candidate.id]
                    max = candidate.ballots.length
                } else if (candidate.ballots.length == max) {
                    winners.push(candidate.id)
                }
            }

            await prisma.voteSession.update({
                where: { id: VSitem.id },
                data: {
                    electionId: winners,
                },
            })
        }
    }

    return await prisma.voteSession.findMany({
        include: { candidates: true },
    })
})