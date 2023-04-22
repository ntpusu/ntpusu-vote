<template>
    <div class="pt-16">
        <ElResult icon="error" title="404 NOT FOUND🧐"></ElResult>
        <NuxtLink to="/" class="grid text-center text-sm">
            {{ countdown.toFixed(1) }} 秒後自動跳轉至首頁
        </NuxtLink>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    title: '404 NOT FOUND',
    layout: 'error',
    auth: false,
})

const event = useRequestEvent()
setResponseStatus(event, 404)

const countdown = ref(10)
const timer = () => {
    setTimeout(async () => {
        countdown.value -= 0.1

        if (countdown.value > 0.1) timer()
        else await useRouter().push('/')
    }, 100)
}

onMounted(async () => {
    if (useRoute().path != '/404/') await useRouter().push('/404/')
    else timer()
})
</script>
