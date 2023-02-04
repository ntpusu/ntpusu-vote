<template>

</template>

<script lang="ts" setup>
onMounted(() => {
    $fetch('/api/logout')
    useState('loginState').value = false
    useRouter().push('/login')
})
</script>

<style>
.content {
    width: 400px;
    margin: 5% auto;
}
</style>