<template>
    {{ VS }}
    {{ VSPending }}
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['auth'],
})

const { data: VS, pending: VSPending, error: VSError, refresh: VSRefresh } = useFetch('/api/voteSession')
</script>

<style>

</style>