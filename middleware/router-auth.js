import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'
export default defineNuxtRouteMiddleware((to, from) => {
    const config = useRuntimeConfig()
    let authStates = false
    let username = useCookie('un').value

    console.log(username)
    if (username !== undefined && username != '') {
        const un = AES.decrypt(username, config.CRYPTO_KEY).toString(encUtf8)

        authStates = !isNaN(parseInt(un))
    }

    console.log(authStates, !authStates, to.path)
    if (!authStates) {
        console.log('redirect to login')
        username = ''
        return navigateTo('/')
    }
})