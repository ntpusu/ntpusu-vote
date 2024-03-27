
// const SECRET_KEY = process.env.RECAPTCHA_V2_SECRET_KEY;
const SECRET_KEY = process.env.RECAPTCHA_V2_INVISIBLE_SECRET_KEY
export default defineEventHandler(async (event) => {
  // const { response } = await readBody(req) as { response: string | undefined }
  // res.setHeader('Content-Type', 'application/json')
  // console.log('in export')
  // console.log('in API');
  console.log('test')
  // try {
  // const test = await JSON.parse(req);
  // console.log(await JSON.parse(req));
  const { response } = await readBody(event) as { response: string | undefined }
  // const { token } = await readBody(req) as {token: string | undefined}
  // console.log(`token: ${token} |
  // readbody: ${await readBody(req)}|
  // SECRET_KEY: ${SECRET_KEY}`);

  // if (!token) {
  //   console.log('no token');
  //   res.end(JSON.stringify({
  //     success: false,
  //     message: 'Invalid token'
  //   }))
  //   return
  // }
  if (!response) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      message: 'Invalid token.',
    })
    // return event.res.status(400).json({
    //   success: false,
    //   message: 'Invalid token'
    // });
  }
  
  //console.log(process.env.RECAPTCHA_V2_SECRET_KEY)
  console.log(process.env.RECAPTCHA_V2_INVISIBLE_SECRET_KEY)
  console.log(response)
  
  return await $fetch('https://www.google.com/recaptcha/api/siteverify', {
    method: 'POST',
    params: {
      //secret: process.env.RECAPTCHA_V2_SECRET_KEY,
      secret: process.env.RECAPTCHA_V2_INVISIBLE_SECRET_KEY,
      response,
    },
  })


  // interface ResponseData {
  //   success: string | undefined 
  // }

  // const response = await $fetch(
  //   `https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${token}`
  // )as ResponseData;
  // console.log('fetch response');

  //     if (response.success) {
  //     res.end(JSON.stringify({
  //       success: true,
  //       message: 'Token verifyed',
  //       response: response
  //     }))
  //   } else {
  //     res.end(JSON.stringify({
  //       success: false,
  //       message: 'Invalid token',
  //       response: response
  //     }))
  //   }
  // } catch (e) {
  //   console.log('ReCaptcha error:', e)
  //   res.end(JSON.stringify({
  //     success: false,
  //     message: 'Internal error'
  //   }))
  // }
})