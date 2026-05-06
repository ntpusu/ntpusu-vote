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

  const body = new URLSearchParams({
    secret: process.env.RECAPTCHA_V2_INVISIBLE_SECRET_KEY ?? '',
    response,
  })

  const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    body,
  })

  return await recaptchaResponse.json()
})
