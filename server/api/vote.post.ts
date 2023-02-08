import prisma from '~/lib/prisma'
import AES from 'crypto-js/aes'
import SHA256 from 'crypto-js/sha256'
import encUtf8 from 'crypto-js/enc-utf8'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    if (un === undefined || un === null) {
        return { respond: false }
    }

    const username = AES.decrypt(un, process.env.CRYPTO_KEY as string).toString(encUtf8)

    if (isNaN(parseInt(username))) {
        return { respond: false }
    }

    const { candidateId } = await readBody(_event)

    const candidate = await prisma.candidate.findUnique({ where: { id: parseInt(candidateId) } })

    const voteSession = await prisma.voteSession.findUnique({ where: { id: candidate?.voteSessionId } })

    const token = SHA256(username + voteSession?.name + process.env.CRYPTO_KEY as string).toString()

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