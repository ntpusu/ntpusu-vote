export default defineEventHandler(async (event) => {
  // 執行操作
  const { response } = await readBody(event) as { response: string | undefined }
  if (!response) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Missing reCAPTCHA response',
    })
  }

  return await $fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    params: {
      secret: process.env.RECAPTCHA_V2_INVISIBLE_SECRET_KEY,
      response,
    },
  })
})
