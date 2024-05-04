import prisma from '~/lib/prisma'
import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        return false
    }

    const email = session.user.email
    const id = parseInt(email.substring(1, 10))

    const admin = await prisma.admin.findUnique({
        where: { id },
        select: null,
    })

    return admin !== null || id.toString() == process.env.SUPER_ADMIN
})
