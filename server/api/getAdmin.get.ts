import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const res = await $fetch('/api/checkAdmin', { method: 'POST', body: JSON.stringify({ un: un }) })

    if (!res.superadmin) {
        return undefined
    }

    return await prisma.admin.findMany()
})