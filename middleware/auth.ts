import { stringify } from "crypto-js/enc-utf8"

export default defineNuxtRouteMiddleware(async (to, from) => {
    const config = useRuntimeConfig()
    const un = useCookie('un').value

    let authStates = false
    if (un !== undefined && un !== null) {
        const res = await $fetch('/api/checkLogin', {
            method: 'POST',
            body: JSON.stringify({ un: un })
        }) as any

        authStates = res.result
    }

    const loginState = useState('loginState')
    loginState.value = authStates

    if (!authStates) {
        await $fetch('/api/logout')

        if (to.path != '/' && to.path != '/login') {
            return await navigateTo('/')
        }
    }

    if (to.path == '/admin') {
        const admin = await $fetch('/api/checkAdmin', {
            method: 'POST',
            body: JSON.stringify({ un: un })
        })

        if (admin.result == false) {
            return await navigateTo('/')
        }
    }
})