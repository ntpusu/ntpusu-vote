export default defineNuxtRouteMiddleware(async (_to, _from) => {
    if (import.meta.client) {
        const isAdmin = await $fetch('/api/checkAdmin')

        if (!isAdmin) {
            return await navigateTo('/404')
        }
    }
    else {
        return await navigateTo('/404')
    }
})
