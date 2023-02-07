<template>
    <el-space v-if="!VSPending" class="justify-center" wrap>
        <el-card v-for="VSitem in VS" :key="VSitem.id" style="width: 350px">
            <template #header>
                <el-space class="!flex justify-between">
                    <div class="">
                        {{ VSitem.name }}
                    </div>
                    <div>
                        <div class="text-xs">
                            開始：{{ viewDate(VSitem.startTime) }}
                        </div>
                        <div class="text-xs">
                            截止：{{ viewDate(VSitem.endTime) }}
                        </div>
                    </div>
                </el-space>
            </template>
            <dix>候選人：</dix>
            <div v-for="(candidate, index) in VSitem.candidates" :key="index">
                {{ index + 1 }}. {{ candidate.name }}
            </div>
            <el-divider />
            <div class="px-28">
                <el-button
                    type="primary"
                    class="w-full"
                    @click="useRouter().push('/vote/' + VSitem.id)"
                    >投票</el-button
                >
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
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = useFetch('/api/VsCa')

const newDate = (time: Date) => {
    return new Date(time)
}

const viewDate = (time: Date) => {
    return newDate(time).toLocaleString()
}

const timeCnt = (time: Date) => {
    return newDate(time).getTime()
}
</script>
