<template>
    <ClientOnly>
        <el-form :label-width="'auto'">
            <el-form-item label="名稱:">
                <el-input v-model="addVote.name" placeholder="請輸入名稱" clearable />
            </el-form-item>
            <el-form-item label="截止時間:">
                <el-input v-model="addVote.endTime" type="password" placeholder="請輸入密碼" show-password clearable />
            </el-form-item>
        </el-form>
    </ClientOnly>
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['auth'],
})

const addVote = reactive({
    name: '',
    endTime: '',
})


</script>

<style>

</style>