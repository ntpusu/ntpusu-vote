export default defineEventHandler(async (event) => {
    setResponseStatus(event, 200)
    return event.context.isSuperAdmin as boolean
})
