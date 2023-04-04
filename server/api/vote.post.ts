import prisma from '~/lib/prisma'
import SHA256 from 'crypto-js/sha256.js'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        return null
    }

    const email = session['user']['email']
    const studentId = email.substring(1, 10)

    if (studentId != process.env.ADMIN) {
        return null
    }

    const { candidateId } = await readBody(event)

    const candidate = await prisma.candidate.findUnique({ where: { id: parseInt(candidateId) } })

    const voteSession = await prisma.voteSession.findUnique({ where: { id: candidate!.voteSessionId } })

    const token = SHA256(studentId + voteSession!.name + process.env.CRYPTO_KEY as string).toString()

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