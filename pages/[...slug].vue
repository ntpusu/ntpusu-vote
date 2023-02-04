<template>
    <el-result icon="error" title="404 NOT FOUND🧐">
        <template #extra>
            <h5 v-if="countdown <= 5">{{ countdown.toFixed(1) }}秒後自動跳轉至首頁</h5>
        </template>
    </el-result>
</template>

<script lang="ts" setup>
setResponseStatus(404)

const countdown = ref(10)
const timer = () => {
    setTimeout(() => {
        countdown.value -= 0.1

        if (countdown.value > 0.1) {
            timer()
        }
        else {
            useRouter().push('/')
        }
    }, 100)
}

onMounted(() => {
    timer()
})
</script>

<style scoped>
.content {
    text-align: center;
    margin: auto;
}
</style>