import prisma from '~/lib/prisma'
import AES from 'crypto-js/aes.js'
import encUtf8 from 'crypto-js/enc-utf8.js'
export default defineEventHandler(async (_event) => {
    const { un } = await readBody(_event)

    if (un === undefined || un === null) {
        return { result: false }
    }

    const username = AES.decrypt(un, process.env.CRYPTO_KEY as string).toString(encUtf8)

    const login = !isNaN(parseInt(username))

    return { result: login }
})