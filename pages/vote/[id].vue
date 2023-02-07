<template></template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['auth'],
})

const { id } = useRoute().params
</script>
