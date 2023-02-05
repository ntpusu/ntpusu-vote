import prisma from '~~/lib/prisma'
import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'
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

    const { VSid } = getQuery(_event)
    console.log('VSid: ' + VSid)


    return { data: true }
})