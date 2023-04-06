<template>
    <h1 class="text-center text-3xl font-black">就是首頁</h1>
    <ElDivider border-style="dotted" />
    <NuxtLink
        to="/vote"
        class="block text-center text-xl font-black text-red-500 hover:text-red-400 hover:underline"
        >前往投票</NuxtLink
    >
</template>

<script lang="ts" setup>
definePageMeta({
    auth: false,
    title: '首頁',
})
</script>
