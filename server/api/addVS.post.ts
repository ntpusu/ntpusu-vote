import prisma from '~~/lib/prisma'
import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')
    if (un === undefined || un === null) {
        return {
            login: false
        }
    }

    const username = AES.decrypt(un, process.env.CRYPTO_KEY as string).toString(encUtf8)
    if (username != process.env.ADMIN_USERNAME as string) {
        return {
            login: false
        }
    }

    const { voteName, endTime } = await readBody(_event)

    const VS = await prisma.voteSession.create({
        data: {
            name: voteName,
            endTime: new Date(endTime),
        }
    })

    return VS
})