import prisma from '~/lib/prisma'
import AES from 'crypto-js/aes.js'
import SHA256 from 'crypto-js/sha256.js'
import encUtf8 from 'crypto-js/enc-utf8.js'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const login = await $fetch('/api/checkLogin', { method: 'POST', body: JSON.stringify({ un: un }) })

    if (!login.login) {
        return undefined
    }

    const username = AES.decrypt(un!, process.env.CRYPTO_KEY as string).toString(encUtf8)

    const { candidateId } = await readBody(_event)

    const candidate = await prisma.candidate.findUnique({ where: { id: parseInt(candidateId) } })

    const voteSession = await prisma.voteSession.findUnique({ where: { id: candidate!.voteSessionId } })

    const token = SHA256(username + voteSession!.name + process.env.CRYPTO_KEY as string).toString()

    try {
        await prisma.ballot.create({
            data: { token, candidateId: parseInt(candidateId) }
        })
    }
    catch (e) {
        return { respond: false, token }
    }

    return { respond: true, token }
})