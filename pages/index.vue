<template>
    <div v-if="username != ''">user: {{ username }}</div>
</template>

<script lang="ts" setup>
import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'

definePageMeta({
    middleware: ['auth'],
})

const username = ref('')

onMounted(async () => {
    const config = useRuntimeConfig()

    // const un = await $fetch('/api/un')
    const un = useCookie('un')
    if (un.value != '') {
        username.value = AES.decrypt(
            un.value!,
            config.public.CRYPTO_KEY
        ).toString(encUtf8)
    } else username.value = '未登入'
})
</script>
