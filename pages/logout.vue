<template>

</template>

<script lang="ts" setup>
onMounted(async () => {
    await $fetch('/api/logout')
    useRouter().push('/')
})
</script>