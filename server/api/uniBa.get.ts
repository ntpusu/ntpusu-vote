import prisma from '~/lib/prisma'
import AES from 'crypto-js/aes.js'
import SHA256 from 'crypto-js/sha256.js'
import encUtf8 from 'crypto-js/enc-utf8.js'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')
    const query = getQuery(_event)
    const title = query.title

    if (un === undefined || un === null) {
        return { respond: false }
    }

    const username = AES.decrypt(un, process.env.CRYPTO_KEY as string).toString(encUtf8)

    try {
        const ballot = await prisma.ballot.findUniqueOrThrow({
            where: { token: SHA256(username + title + process.env.CRYPTO_KEY as string).toString() },
        })

        return { respond: true, candidateId: ballot.candidateId, ballot }
    } catch (e) {
        return { respond: false }
    }
})