import prisma from '~/lib/prisma'
export default defineEventHandler(async (event) => {
    const { id } = await readBody(event) as { id: string | undefined }

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request',
        })
    }

    const admin = await prisma.admin.findUnique({
        where: { id: parseInt(id) },
        select: null,
    })

    return admin !== null
})