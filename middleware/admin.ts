export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.client) {
        const isAdmin = await $fetch('/api/checkAdmin')

        if (!isAdmin) {
            return await navigateTo('/404')
        }
    }
    else {
        return await navigateTo('/404')
    }
})
