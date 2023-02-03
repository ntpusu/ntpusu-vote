export default defineEventHandler((_event) => {
    deleteCookie(_event, 'un')
    return {}
})