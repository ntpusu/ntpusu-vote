export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.client) {
        const isSuperAdmin = await $fetch('/api/checkSuperAdmin')

        if (!isSuperAdmin) {
            return await navigateTo('/404')
        }
    }
    else {
        return await navigateTo('/404')
    }
})
