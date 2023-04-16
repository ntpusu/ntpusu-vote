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
    <ElSkeleton v-else animated />
    <ElButton @click="adminRefresh()">
        <span class="font-bold tracking-[2px]">刷新</span>
    </ElButton>
    <ElDivider />
    <div class="flex">
        <ElInput v-model="addId" placeholder="請輸入ID" clearable />
        <ElButton v-if="!adminPending" type="primary" @click="addAdmin">
            <span class="font-bold tracking-[2px]">新增</span>
        </ElButton>
    </div>
    <ElDivider />
    <div class="flex">
        <ElInput v-model="delId" placeholder="請輸入ID" clearable />
        <ElButton v-if="!adminPending" type="primary" @click="delAdmin">
            <span class="font-bold tracking-[2px]">刪除</span>
        </ElButton>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['super-admin'],
    title: '設定管理員',
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
