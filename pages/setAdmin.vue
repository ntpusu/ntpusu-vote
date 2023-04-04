<template>
    <div v-if="!adminPending">
        <div
            v-for="(adminItem, index) in admin"
            :key="index"
            class="flex justify-center"
        >
            {{ adminItem.id }}
        </div>
    </div>
    <el-empty v-else description="loading......" />
    <el-button @click="adminRefresh()">刷新</el-button>
    <el-divider />
    <div class="flex">
        <el-input v-model="addId" placeholder="請輸入ID" clearable />
        <el-button v-if="!adminPending" type="primary" @click="addAdmin"
            >新增</el-button
        >
    </div>
    <el-divider />
    <div class="flex">
        <el-input v-model="delId" placeholder="請輸入ID" clearable />
        <el-button v-if="!adminPending" type="primary" @click="delAdmin"
            >刪除</el-button
        >
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['super-admin'],
})

const {
    data: admin,
    pending: adminPending,
    refresh: adminRefresh,
} = useLazyFetch('/api/getAdmin')

const addId = ref('')
const delId = ref('')

const addAdmin = async () => {
    await $fetch('/api/addAdmin?' + new URLSearchParams({ id: addId.value }), {
        method: 'PUT',
    })

    addId.value = ''
    await adminRefresh()
}

const delAdmin = async () => {
    await $fetch('/api/delAdmin?' + new URLSearchParams({ id: delId.value }), {
        method: 'DELETE',
    })

    delId.value = ''
    await adminRefresh()
}
</script>
