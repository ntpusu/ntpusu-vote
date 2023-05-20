<template>
    <div>
        <ElForm
            label-width="auto"
            label-suffix=":"
            hide-required-asterisk
            class="m-auto flex w-full flex-col items-center justify-center py-10"
        >
            <ElFormItem
                label="學號"
                class="m-auto w-11/12 md:w-2/3 lg:w-1/2"
            >
                <ElInput
                    v-model="voter"
                    placeholder="請輸入學號"
                    clearable
                />
            </ElFormItem>
            <ElButton
                type="primary"
                class="w-1/5 !rounded-md md:w-1/6 lg:w-1/12"
                @click="searchVoter"
            >
                <span class="font-bold">查 詢</span>
            </ElButton>
            <ClientOnly>
                <ElDialog
                    v-if="voterData"
                    title="選票內容"
                    center
                    align-center
                    v-model="voterShow"
                    width="30%"
                    class="min-w-fit !rounded-lg px-5"
                >
                    <div
                        class="flex flex-col flex-wrap items-start justify-center"
                    >
                        <h1 class="text-lg font-bold">
                            學號：{{ voterData.id }}
                        </h1>
                        <h1 class="text-lg font-bold">
                            組別：{{ voterData.group }}
                        </h1>
                        <h1 class="text-lg font-bold">
                            是否登入：{{ voterData.first.serNum ? '是' : '否' }}
                        </h1>
                        <h1
                            v-if="voterData.first.serNum"
                            class="text-lg font-bold"
                        >
                            第 {{ voterData.first.serNum }} 個登入者
                        </h1>
                        <h1
                            v-if="voterData.first.time"
                            class="text-lg font-bold"
                        >
                            登入時間：{{
                                new Date(voterData.first.time).toLocaleString()
                            }}
                        </h1>
                    </div>
                </ElDialog>
            </ClientOnly>
        </ElForm>
        <ElDivider />
        <ElForm
            label-width="auto"
            label-suffix=":"
            hide-required-asterisk
            class="m-auto flex w-full flex-col items-center justify-center py-10"
        >
            <ElFormItem
                label="憑證"
                class="m-auto w-11/12 md:w-2/3 lg:w-1/2"
            >
                <ElInput
                    v-model="token"
                    placeholder="請輸入憑證"
                    clearable
                />
            </ElFormItem>
            <ElButton
                type="primary"
                class="w-1/5 !rounded-md md:w-1/6 lg:w-1/12"
                @click="searchToken"
            >
                <span class="font-bold">查 詢</span>
            </ElButton>
            <ClientOnly>
                <ElDialog
                    v-if="tokenData"
                    title="選票內容"
                    center
                    align-center
                    v-model="tokenShow"
                    width="30%"
                    class="min-w-fit !rounded-lg px-5"
                >
                    <div
                        class="flex flex-col flex-wrap items-start justify-center"
                    >
                        <h1 class="text-lg font-bold">
                            項目：{{ tokenData.vote }}
                        </h1>
                        <h1 class="text-lg font-bold">
                            選擇：{{ tokenData.candidate }}
                        </h1>
                        <h1 class="text-lg font-bold">
                            時間：{{
                                new Date(tokenData.time).toLocaleString()
                            }}
                        </h1>
                    </div>
                </ElDialog>
            </ClientOnly>
        </ElForm>
    </div>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['admin'],
    title: '查詢',
})

const voter = ref('')
const token = ref('')

const voterShow = ref(false)
const tokenShow = ref(false)

const voterData: Ref<{
    id: number
    group: string
    first: {
        serNum: number | null
        time: string | null
    }
} | null> = ref(null)

const tokenData: Ref<{
    vote: string
    candidate: string
    time: string
} | null> = ref(null)

const searchVoter = async () => {
    if (voter.value == '') {
        ElMessage({
            message: '請輸入憑證',
            type: 'warning',
        })
        return
    }

    const res = await useFetch('/api/getVoter', {
        query: { voter: voter.value },
    })

    if (res.error.value) {
        ElMessage({
            message: '查無此人',
            type: 'warning',
        })
        return
    }

    voterData.value = res.data.value

    voterShow.value = true
}

const searchToken = async () => {
    if (token.value == '') {
        ElMessage({
            message: '請輸入憑證',
            type: 'warning',
        })
        return
    }

    const res = await useFetch('/api/getBallot', {
        query: { token: token.value },
    })

    if (res.error.value) {
        ElMessage({
            message: '查無此憑證',
            type: 'warning',
        })
        return
    }

    tokenData.value = res.data.value

    tokenShow.value = true
}
</script>
