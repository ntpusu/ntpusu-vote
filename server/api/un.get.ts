export default defineEventHandler((_event) => {
    const un = getCookie(_event, 'un')
    return un === undefined ? '' : un
})