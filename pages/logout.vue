<template>

</template>

<script lang="ts" setup>
onMounted(() => {
    $fetch('/api/logout').then(() => {
        useRouter().push('/login')
    })
})
</script>

<style>
.content {
    width: 400px;
    margin: 5% auto;
}
</style>