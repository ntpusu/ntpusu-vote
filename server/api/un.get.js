import AES from 'crypto-js/aes'
export default defineEventHandler(async (_event) => {
    return getCookie(_event, 'un')
})