export default defineNuxtRouteMiddleware(async (to, from) => {
    const un = useCookie('un').value

    let loginState = false
    let adminState = false
    let superState = false
    if (un !== undefined && un !== null) {
        const loginRes = await $fetch('/api/checkLogin', {
            method: 'POST',
            body: JSON.stringify({ un: un })
        })

        const adminRes = await $fetch('/api/checkAdmin', {
            method: 'POST',
            body: JSON.stringify({ un: un })
        })

        useState('loginState').value = loginRes.result
        loginState = loginRes.result

        useState('adminState').value = adminRes.admin
        adminState = adminRes.admin
        superState = adminRes.superadmin
    }

    if (!loginState) {
        await $fetch('/api/logout')

        if (to.path != '/' && to.path != '/login') {
            return await navigateTo('/')
        }
    }

    if (to.path == '/admin' && !adminState) {
        return await navigateTo('/')
    }

    if (to.path == '/setAdmin' && !superState) {
        return await navigateTo('/')
    }
})