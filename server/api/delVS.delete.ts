import prisma from '~~/lib/prisma'
import AES from 'crypto-js/aes.js'
import encUtf8 from 'crypto-js/enc-utf8.js'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')
    if (un === undefined || un === null) {
        return {
            data: false
        }
    }

    const username = AES.decrypt(un, process.env.CRYPTO_KEY as string).toString(encUtf8)
    if (username != process.env.ADMIN_USERNAME as string) {
        return {
            data: false
        }
    }

    const query = getQuery(_event)
    const VSTitle = query.title

    const VS = await prisma.voteSession.findUnique({
        where: { name: VSTitle as string },
    })

    await prisma.candidate.deleteMany({
        where: { voteSessionId: VS?.id },
    })

    await prisma.voteSession.delete({
        where: { name: VSTitle as string },
    })

    return { data: true }
})