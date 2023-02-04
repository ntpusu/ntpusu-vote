import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'
export default defineNuxtRouteMiddleware(async (to, from) => {
    const config = useRuntimeConfig()
    let authStates = false

    let username = await $fetch('/api/un')
    if (username != '') {
        const un = AES.decrypt(username!, config.CRYPTO_KEY).toString(encUtf8)

        authStates = !isNaN(parseInt(un))
    }

    const loginState = useState('loginState')
    loginState.value = authStates

    if (!authStates) {
        await $fetch('/api/logout')

        if (to.path != '/' && to.path != '/login') {
            return navigateTo('/')
        }
    }
})