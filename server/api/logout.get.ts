export default defineEventHandler(async (_event) => {
    deleteCookie(_event, 'un')
    return {}
})