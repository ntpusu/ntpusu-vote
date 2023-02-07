<template>
    <el-space v-if="!VSPending" class="justify-center" wrap>
        <el-card v-for="VSitem in VS" :key="VSitem.id" style="width: 400px">
            <template #header>
                <el-space class="!flex justify-between">
                    <div class="text-xl font-bold">
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
            <dix>
                <div
                    v-for="(candidate, index) in VSitem.candidates"
                    :key="index"
                >
                    {{ index + 1 }}. {{ candidate.name }}
                </div>
            </dix>
            <el-divider border-style="dotted" />
            <div class="text px-32">
                <el-button
                    v-if="timeCnt(VSitem.endTime) < Date.now()"
                    type="primary"
                    class="w-full tracking-widest"
                    @click="useRouter().push('/vote/' + VSitem.id)"
                    >結果
                </el-button>
                <el-button
                    v-else-if="timeCnt(VSitem.startTime) < Date.now()"
                    type="primary"
                    class="w-full tracking-widest"
                    >投票
                </el-button>
            </div>
        </el-card>
    </el-space>
    <el-empty v-else description="loading......" />
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

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

const formRef = ref<FormInstance>()

const voteData = reactive<{
    selected: number
}>({
    selected: 0,
})
</script>
