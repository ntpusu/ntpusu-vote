<template>
    <div v-for="(adminItem, index) in admin" :key="index">
        {{ adminItem.id }}
    </div>
    <el-input v-model="addId" placeholder="請輸入ID" clearable />
    <el-button @click="addAdmin">新增</el-button>
    <el-input v-model="delId" placeholder="請輸入ID" clearable />
    <el-button @click="delAdmin">刪除</el-button>
</template>

<script lang="ts" setup>
const { data: admin, refresh: adminRefresh } = useFetch('/api/getAdmin')

const addId = ref('')
const delId = ref('')

const addAdmin = async () => {
    await $fetch('/api/addAdmin', {
        method: 'POST',
        body: JSON.stringify({ id: addId.value }),
    })

    addId.value = ''
    adminRefresh()
}

const delAdmin = async () => {
    await $fetch('/api/delAdmin', {
        method: 'POST',
        body: JSON.stringify({ id: delId.value }),
    })

    delId.value = ''
    adminRefresh()
}
</script>
