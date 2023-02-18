import prisma from '~/lib/prisma'
export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')

    const login = await $fetch('/api/checkAdminstrator', { method: 'POST', body: JSON.stringify({ un: un }) }) as any

    if (!login.result) {
        return undefined
    }

    const { id } = await readBody(_event)

    await prisma.admin.create({ data: { id: id } })

    return {}
})