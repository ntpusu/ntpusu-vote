import prisma from '~/lib/prisma'
import SHA256 from 'crypto-js/sha256.js'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        return { result: false }
    }

    const email = session['user']['email']
    const studentId = email.substring(1, 10)

    const voter = await prisma.voter.findUnique({
        where: { id: parseInt(studentId) },
    })

    if (!voter) {
        return { result: false }
    }

    const { candidateId } = await readBody(event)

    if (!candidateId) {
        return { result: false }
    }

    const candidate = await prisma.candidate.findUnique({ where: { id: parseInt(candidateId) } })

    if (!candidate) {
        return { result: false }
    }

    const voteSession = await prisma.voteSession.findUnique({ where: { id: candidate.voteSessionId } })

    if (!voteSession) {
        return { result: false }
    }

    const token = SHA256(studentId + voteSession!.name + process.env.AUTH_SECRET).toString()

    try {
        await prisma.ballot.create({
            data: { token, candidateId: parseInt(candidateId) }
        })
    }
    catch (e) {
        return { result: true, vote: false, token }
    }

    return { result: true, vote: true, token }
})