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

    console.log('start')

    const { voteName, startTime, endTime, candidates } = await readBody(_event)

    console.log('voteName: ' + voteName)
    console.log('startTime: ' + startTime)
    console.log('endTime: ' + endTime)
    console.log('candidates: ' + candidates)

    const VS = await prisma.voteSession.create({
        data: {
            name: voteName,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
        }
    })

    console.log('VS created')

    for (let i = 0; i < candidates.length; i++) {
        console.log('candidate created')
        await prisma.candidate.create({
            data: {
                name: candidates[i],
                voteSessionId: VS.id
            }
        })
    }

    return { data: true }
})