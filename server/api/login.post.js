export default defineEventHandler(async (event) => {
    const { username, password } = await readBody(event)

    const payload = 'stud_num=' + username + '&passwd=' + password + '&x=0&y=0'

    console.log(payload)

    const res = await fetch(process.env.STUDENT_SYSTEM_URL, {
        method: 'POST',
        body: payload
    }).then(res => res.text())

    return res.startsWith('<body onload="window.open(\'../univer/query_all_course.login2?date1=')
})