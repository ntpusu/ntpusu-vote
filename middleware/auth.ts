export default defineNuxtRouteMiddleware(async (to, from) => {
    const un = useCookie('un').value

    if (un !== undefined && un !== null) {
        const res = await $fetch('/api/checkLogin', {
            method: 'POST',
            body: JSON.stringify({ un: un })
        }) as any

        var authStates = res.result
    }

    const loginState = useState('loginState')
    loginState.value = authStates

    if (!authStates) {
        await $fetch('/api/logout')

        if (to.path != '/' && to.path != '/login') {
            return await navigateTo('/')
        }
    }

    if (to.path == '/admin' || to.path == '/setAdmin') {
        const res = await $fetch('/api/checkAdmin', {
            method: 'POST',
            body: JSON.stringify({ un: un })
        })

        if (to.path == '/admin' && !res.admin) {
            return await navigateTo('/')
        }

        if (to.path == '/setAdmin' && !res.superadmin) {
            return await navigateTo('/')
        }
    }
})