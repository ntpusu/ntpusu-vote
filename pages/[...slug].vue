<template>
    <div class="pt-16">
        <el-result icon="error" title="404 NOT FOUND🧐"></el-result>
        <nuxt-link to="/" class="grid text-center text-sm"
            >{{ countdown.toFixed(1) }} 秒後自動跳轉至首頁</nuxt-link
        >
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    title: '404 NOT FOUND',
    description: '404 NOT FOUND',
    keywords: '404 NOT FOUND',
    layout: 'error',
    auth: false,
})

const countdown = ref(10)
const timer = () => {
    setTimeout(() => {
        countdown.value -= 0.1

        if (countdown.value > 0.1) {
            timer()
        } else {
            useRouter().push('/')
        }
    }, 100)
}

onMounted(() => {
    timer()
})
</script>
