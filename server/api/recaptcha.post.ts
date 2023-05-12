import { getServerSession } from '#auth'
export default defineEventHandler(async (event) => {
    const { response } = await readBody(event) as { response: string | undefined }

    if (!response) {
        throw createError({
            statusCode: 400,
            message: 'Bad Request',
        })
    }

    const session = await getServerSession(event)

    if (!session) {
        throw createError({
            statusCode: 401,
            message: '未登入',
        })
    }

    return await $fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        params: {
            secret: process.env.RECAPTCHA_V3_SECRET,
            response,
        },
    })
})