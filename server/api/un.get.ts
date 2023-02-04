export default defineEventHandler(async (_event) => {
    const un = getCookie(_event, 'un')
    return un === undefined ? '' : un
})