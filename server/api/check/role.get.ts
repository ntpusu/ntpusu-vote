export default defineEventHandler(async (event) => {
    setResponseStatus(event, 200)
    return {
        admin: event.context.isAdmin === true,
        superAdmin: event.context.isSuperAdmin === true,
    }
})
