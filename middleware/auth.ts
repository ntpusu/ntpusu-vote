import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const config = useRuntimeConfig()
    let authStates = false

    const username = useCookie('un').value
    console.log('username', username)
    if (username !== undefined && username !== null) {
        const un = AES.decrypt(username, config.public.CRYPTO_KEY).toString(encUtf8)

        authStates = !isNaN(parseInt(un))
    }

    const loginState = useState('loginState')
    loginState.value = authStates

    console.log('authStates', authStates)
    if (!authStates) {
        await $fetch('/api/logout')

        if (to.path != '/' && to.path != '/login') {
            return navigateTo('/')
        }
    }
})