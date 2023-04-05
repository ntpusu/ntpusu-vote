<template>
    <h1 class="text-center text-4xl font-black">就是首頁</h1>
    <NuxtLink to="/vote" class="text-center text-xl font-black"
        >前往投票</NuxtLink
    >
</template>

<script lang="ts" setup>
definePageMeta({
    auth: false,
})
</script>
