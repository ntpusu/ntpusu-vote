<template>
    <el-space v-if="!VSPending" class="justify-center" wrap>
        <el-card v-for="VSitem in VS" :key="VSitem.id" style="width: 300px">
            <template #header>
                <div>
                    <span v-if="VS != null" class="">{{ VSitem.name }}</span>
                </div>
            </template>
            <div>截止時間：{{ viewDate(VSitem.endTime) }}</div>
        </el-card>
    </el-space>
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['auth'],
})

const {
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = useFetch('/api/voteSession')

const newDate = (time: Date) => {
    return new Date(time)
}

const viewDate = (time: Date) => {
    return newDate(time).toLocaleString()
}
</script>
