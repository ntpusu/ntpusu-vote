export default defineNuxtRouteMiddleware(async (to, from) => {
    const { data } = useSession()

    if (!data) {
        return await navigateTo('/')
    }

    const email = data.value?.user?.email

    if (!email) {
        return await navigateTo('/')
    }

    const id = email.substring(1, 10)
    const admin = await $fetch('/api/checkAdmin', {
        method: 'POST',
        body: JSON.stringify({ id })
    })

    if (!admin) {
        return await navigateTo('/')
    }
})