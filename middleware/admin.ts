export default defineNuxtRouteMiddleware(async (to, from) => {
    if (process.client) {
        const { data: admin } = await useFetch('/api/checkAdmin')

        if (!admin) {
            return await navigateTo('/404')
        }
    }
    else {
        return await navigateTo('/404')
    }
})