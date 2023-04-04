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

    if (id !== useRuntimeConfig().public.ADMIN) {
        return await navigateTo('/')
    }
})