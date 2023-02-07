import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const config = useRuntimeConfig()
    const un = useCookie('un').value

    let username = ''
    let authStates = false
    if (un !== undefined && un !== null) {
        username = AES.decrypt(un, config.public.CRYPTO_KEY).toString(encUtf8)

        authStates = !isNaN(parseInt(username))
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
        const admin = await $fetch('/api/checkAdmin')
        if (admin.result == false) {
            return await navigateTo('/')
        }
    }
})