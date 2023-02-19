import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const login = await $fetch('/api/checkAdministrator', { method: 'POST', body: JSON.stringify({ un: un }) }) as any

    if (!login.result) {
        return undefined
    }

    const admin = await prisma.admin.findMany()

    return admin
})