import AES from 'crypto-js/aes'
export default defineEventHandler(async (event) => {
    const { username, password } = await readBody(event)

    const payload = 'stud_num=' + username + '&passwd=' + password + '&x=0&y=0'

    const res = await fetch(process.env.STUDENT_SYSTEM_URL, {
        method: 'POST',
        body: payload
    }).then(res => res.text())

    const login_state = res.startsWith('<body onload="window.open(\'../univer/query_all_course.login2?date1=')

    if (login_state) {
        setCookie(event, 'un', AES.encrypt(username, process.env.CRYPTO_KEY).toString(), {
            httpOnly: true,
            secure: true,
            maxAge: 600
        })
    }

    return login_state
})