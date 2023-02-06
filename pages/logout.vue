<script lang="ts" setup>
onMounted(async () => {
    await $fetch('/api/logout')
    await useRouter().push('/login')
})
</script>
