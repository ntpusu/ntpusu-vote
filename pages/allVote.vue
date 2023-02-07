<template>
    <el-space v-if="!VSingPending" class="justify-center" wrap>
        <el-card
            v-for="VSingitem in VSing"
            :key="VSingitem.id"
            style="width: 350px"
        >
            <template #header>
                <el-space class="!flex justify-between">
                    <div class="">
                        {{ VSingitem.name }}
                    </div>
                    <div>
                        <div class="text-xs">
                            開始：{{ viewDate(VSingitem.startTime) }}
                        </div>
                        <div class="text-xs">
                            截止：{{ viewDate(VSingitem.endTime) }}
                        </div>
                    </div>
                </el-space>
            </template>
            <div v-for="candidate in VSingitem.candidates" :key="candidate.id">
                {{ candidate.name }}
            </div>
        </el-card>
    </el-space>
    <el-empty v-else description="loading......" />
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['auth'],
})

const {
    data: VSing,
    pending: VSingPending,
    refresh: VSingRefresh,
} = useFetch('/api/VsCa')

const newDate = (time: Date) => {
    return new Date(time)
}

const viewDate = (time: Date) => {
    return newDate(time).toLocaleString()
}
</script>
