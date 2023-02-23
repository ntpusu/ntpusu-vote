export default defineNuxtRouteMiddleware(async (to, from) => {
    const un = useCookie('un').value

    const loginState = useState('loginState')
    const adminState = useState('adminState')
    const superState = useState('auperState')

    let _loginState = false
    let _adminState = false
    let _superState = false

    if (un !== undefined && un !== null) {
        const loginRes = await $fetch('/api/checkLogin', {
            method: 'POST',
            body: JSON.stringify({ un: un })
        })

        const adminRes = await $fetch('/api/checkAdmin', {
            method: 'POST',
            body: JSON.stringify({ un: un })
        })

        _loginState = loginRes.login
        _adminState = adminRes.admin
        _superState = adminRes.superadmin
    }

    loginState.value = _loginState
    adminState.value = _adminState
    superState.value = _superState

    if (!_loginState) {
        await $fetch('/api/logout')

        if (to.path != '/' && to.path != '/login') {
            return await navigateTo('/')
        }
    }

    if (to.path == '/admin' && !_adminState) {
        return await navigateTo('/')
    }

    if (to.path == '/setAdmin' && !_superState) {
        return await navigateTo('/')
    }
})