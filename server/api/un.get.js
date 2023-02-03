
export default defineEventHandler(async (_event) => {
    let un = null
    try {
        un = getCookie(_event, 'un')
    }
    catch (err) {
        return null
    }

    return getCookie(_event, 'un')
})