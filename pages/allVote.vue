<template>
    <el-space v-if="!VSPending" class="container" wrap>
        <el-card v-for="VSitem in VS" :key="VSitem.id" style="width: 300px">
            <template #header>
                <div>
                    <span v-if="VS != null" class="title">{{
                        VSitem.name
                    }}</span>
                </div>
            </template>
            <div>截止時間：{{ newDate(VSitem.endTime).toLocaleString() }}</div>
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
    return new Date(time).toLocaleString()
}
</script>

<style>
.container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.title {
    font-size: 1.5rem;
    font-weight: bold;
}
</style>
