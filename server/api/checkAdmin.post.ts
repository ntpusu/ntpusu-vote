import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    const { id } = await readBody(event)

    if (!id) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request'
        })
    }

    const admin = await prisma.admin.findUnique({
        where: { id: parseInt(id) },
    })

    return admin !== null
})