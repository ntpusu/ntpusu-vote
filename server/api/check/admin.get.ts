export default defineEventHandler(async (event) => {
    setResponseStatus(event, 200)
    return event.context.isAdmin as boolean
})
