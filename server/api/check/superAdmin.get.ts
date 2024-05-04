import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const session = await getServerSession(event) as { user: { email: string } } | null

    if (!session) {
        return false
    }

    const email = session.user.email
    const id = email.substring(1, 10)

    return id == process.env.SUPER_ADMIN
})
