import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const res = await $fetch('/api/checkAdmin', { method: 'POST', body: JSON.stringify({ un: un }) })

    if (!res.superadmin) {
        return undefined
    }

    const { id } = await readBody(_event)

    await prisma.admin.delete({ where: { id: parseInt(id) } })

    return {}
})