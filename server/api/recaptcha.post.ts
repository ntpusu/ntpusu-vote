export default defineEventHandler(async (event) => {
    const { response } = await readBody(event) as { response: string | undefined }

    if (!response) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            message: 'Parameter "response" is required',
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