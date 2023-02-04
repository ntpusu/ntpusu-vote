<template>

</template>

<script lang="ts" setup>
onMounted(() => {
    $fetch('/api/logout')
    useState('loginState').value = false
    useRouter().push('/')
})
</script>