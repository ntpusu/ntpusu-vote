import AES from 'crypto-js/aes.js'
export default defineEventHandler(async _event => {
    const { username, password } = await readBody(_event)

    const payload = 'stud_num=' + username + '&passwd=' + password + '&x=0&y=0'

    const res = await fetch(process.env.STUDENT_SYSTEM_URL as string, {
        method: 'POST',
        body: payload
    }).then(res => res.text())

    const login_state = res.startsWith('<body onload="window.open(\'../univer/query_all_course.login2?date1=')

    if (login_state) {
        setCookie(_event, 'un', AES.encrypt(username, process.env.CRYPTO_KEY as string).toString(), {
            secure: true,
            sameSite: 'strict',
            maxAge: 60 * 60
        })
    }

    return {
        login: login_state
    }
})