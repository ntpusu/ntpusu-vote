<template>
    <ElSpace
        v-if="!VSPending && VS !== null"
        wrap
        alignment="center"
        class="w-full justify-center"
    >
        <ElCard
            v-for="VSitem in VS"
            :key="VSitem.id"
            shadow="hover"
            class="w-[84vw] !rounded-xl sm:w-[60vw] md:w-[42vw] lg:w-[28vw] xl:w-[21vw]"
        >
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="text-lg font-bold sm:text-xl">
                        {{ VSitem.name }}
                    </div>
                    <div
                        class="flex flex-col justify-end align-middle text-xs sm:text-sm"
                    >
                        <ElTag round effect="plain">
                            開始: {{ viewDate(VSitem.startTime) }}
                        </ElTag>
                        <div class="h-1 w-full" />
                        <ElTag round effect="plain">
                            結束: {{ viewDate(VSitem.endTime) }}
                        </ElTag>
                    </div>
                </div>
            </template>
            <div>
                <h2 class="pb-5 text-center text-base font-bold sm:text-lg">
                    候選人名單
                </h2>
                <ElSpace
                    direction="vertical"
                    alignment="start"
                    class="!flex content-center"
                    size="large"
                    wrap
                >
                    <div
                        v-for="(candidate, itemIndex) in VSitem.candidates"
                        :key="itemIndex"
                        class="flex text-sm sm:text-base"
                    >
                        <ElTag type="success" effect="dark" size="small" round>
                            {{ itemIndex + 1 }}
                        </ElTag>
                        <span>&nbsp;&nbsp;</span>
                        <div>
                            {{ candidate.name }}
                        </div>
                    </div>
                </ElSpace>
            </div>
            <ElDivider />
            <div
                v-if="Date.now() < timeCnt(VSitem.startTime)"
                class="flex justify-center"
            >
                <ElButton type="danger" class="w-fit !rounded-md" plain loading>
                    <span class="font-bold tracking-[2px]">尚未開始</span>
                </ElButton>
            </div>
            <div v-else>
                <ClientOnly>
                    <ElDialog
                        center
                        align-center
                        v-model="voteVisible[VSitem.id]"
                        width="30%"
                        class="mx-5 min-w-fit !rounded-lg"
                        @open="startLoading(VSitem.id)"
                        @close="endLoading(VSitem.id)"
                    >
                        <template #title>
                            <div class="flex">
                                <div
                                    class="m-auto flex text-lg font-bold sm:text-xl md:text-2xl"
                                >
                                    {{ VSitem.name }}
                                </div>
                                <div class="flex-grow" />
                                <div
                                    class="m-auto flex flex-col items-end pl-10 pr-3 text-xs text-gray-500 md:pl-14 md:pr-6 md:text-sm"
                                >
                                    <span class="text-gray-500">請在下方選擇您要投的候選人</span>
                                    <span class="text-pink-500">投出選票後即無法再做變更</span>
                                </div>
                            </div>
                        </template>
                        <div class="mx-5 flex justify-center">
                            <ElRadioGroup
                                class="flex-col !items-stretch"
                                v-model="voteData[VSitem.id]"
                            >
                                <ElRadio
                                    v-for="(
                                        candidate, itemIndex
                                    ) in VSitem.candidates"
                                    :key="itemIndex"
                                    :label="candidate.id"
                                    border
                                    size="large"
                                    class="my-1 !mr-0 max-w-[75vw]"
                                >
                                    <span
                                        class="max-w-full whitespace-pre-wrap break-all"
                                    >
                                        {{ candidate.name }}
                                    </span>
                                </ElRadio>
                            </ElRadioGroup>
                        </div>
                        <ElDivider border-style="dashed" />
                        <div class="flex justify-center">
                            <ElButton
                                type="primary"
                                class="w-fit !rounded-md"
                                @click="voteConfirm(VSitem)"
                                plain
                            >
                                <span class="font-bold tracking-[2px]">
                                    投出選票
                                </span>
                            </ElButton>
                        </div>
                    </ElDialog>
                </ClientOnly>
                <div
                    v-if="Date.now() > timeCnt(VSitem.endTime)"
                    class="flex justify-center"
                >
                    <ElButton
                        type="success"
                        class="w-fit !rounded-md"
                        @click="seeResult(VSitem.id)"
                        plain
                        :loading="resultLoading[VSitem.id]"
                    >
                        <span class="font-bold tracking-[2px]">結果</span>
                    </ElButton>
                </div>
                <div v-else class="flex justify-center">
                    <ElButton
                        type="primary"
                        class="w-fit !rounded-md"
                        :disabled="voteToken[VSitem.id] !== undefined"
                        @click="voteVisible[VSitem.id] = true"
                        plain
                        :loading="voteLoading[VSitem.id]"
                    >
                        <span class="font-bold tracking-[2px]">
                            {{
                                voteToken[VSitem.id] !== undefined ? '已' : ''
                            }}投票
                        </span>
                    </ElButton>
                    <ElButton
                        type="info"
                        class="w-fit !rounded-md"
                        @click="seeToken(VSitem.id)"
                        plain
                        :loading="tokenLoading[VSitem.id]"
                    >
                        <span class="font-bold tracking-[2px]">查看憑證</span>
                    </ElButton>
                </div>
            </div>
        </ElCard>
    </ElSpace>
    <ElSpace v-else alignment="center" class="w-full justify-center" wrap>
        <ElSkeleton v-for="index in rand(3, 5)" animated>
            <template #template>
                <ElSkeletonItem
                    variant="rect"
                    class="!w-[84vw] !rounded-xl sm:!w-[60vw] md:!w-[42vw] lg:!w-[28vw] xl:!w-[21vw]"
                    :style="{ height: rand(15, 20) + 'rem' }"
                />
            </template>
        </ElSkeleton>
    </ElSpace>
    <ClientOnly>
        <ElDialog
            v-model="voteFail"
            align-center
            class="min-w-fit !rounded-lg px-5"
            width="30%"
            @opened="startLoading(null)"
            @closed="endLoading(null)"
        >
            <template #title>
                <div class="text-2xl font-bold text-red-500">投票失敗</div>
            </template>
            <div class="px-5 text-lg">
                可能原因：<br />
                1. 網路連線斷了<br />
                2. 未登入<br />
                3. 學號輸入錯誤<br />
                4. 未在投票時間內投票
            </div>
        </ElDialog>
    </ClientOnly>
</template>

<script lang="ts" setup>
import type { Ballot, Candidate } from '@prisma/client'
import { rand } from '@vueuse/shared'

definePageMeta({
    title: '投票',
})

const {
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = await useLazyFetch('/api/voterSession')

const viewDate = (time: string | number | Date) => {
    return new Date(time).toLocaleString('zh-TW', {
        hourCycle: 'h11',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: 'numeric',
    })
}

const timeCnt = (time: string | number | Date) => {
    return new Date(time).getTime()
}

const voteFail = ref(false)

const voteVisible: Ref<boolean[]> = ref([])
const voteData: Ref<number[]> = ref([])
const voteToken: Ref<string[]> = ref([])
const voteLoading: Ref<boolean[]> = ref([])
const tokenLoading: Ref<boolean[]> = ref([])
const resultLoading: Ref<boolean[]> = ref([])

const startLoading = (id: number | null) => {
    if (id) voteLoading.value[id] = true
    document.body.style.overflowY = 'hidden'
}

const endLoading = (id: number | null) => {
    if (id) voteLoading.value[id] = false
    document.body.style.overflowY = 'auto'
}

const voteConfirm = async (VS: { id: number; candidates: Candidate[] }) => {
    if (!voteData.value[VS.id]) {
        ElMessage({
            type: 'warning',
            message: '請選擇候選人',
        })
        return
    }

    voteVisible.value[VS.id] = false
    setTimeout(() => {
        startLoading(VS.id)
    }, 1)

    const candidate = VS.candidates.find(
        (item: { id: number }) => item.id === voteData.value[VS.id]
    )?.name

    await ElMessageBox.prompt(
        '輸入學號進行確認',
        '確定要投給「' + candidate + '」嗎？',
        {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning',
            inputPlaceholder: '我是輸入欄😎',
            inputPattern: /^\d{8,9}$/,
            inputErrorMessage: '學號格式錯誤',
        }
    )
        .then(async ({ value }) => {
            await $fetch('/api/vote', {
                method: 'POST',
                body: JSON.stringify({
                    VSId: VS.id,
                    candidateId: voteData.value[VS.id],
                    voterId: value,
                }),
            })
                .then(async (res) => {
                    if (res.vote!) {
                        voteToken.value[VS.id] = res.token
                        await ElMessageBox.alert(
                            '憑證：' + res.token!,
                            '投票成功',
                            {
                                confirmButtonText: '複製憑證',
                                type: 'success',
                                roundButton: true,
                            }
                        )
                            .then(async () => {
                                await navigator.clipboard.writeText(res.token)
                                ElMessage({
                                    type: 'success',
                                    message: '已複製',
                                })
                            })
                            .catch(() => {})
                    } else {
                        voteToken.value[VS.id] = res.token
                        await ElMessageBox.alert(
                            '憑證：' + res.token!,
                            '不可重複投票',
                            {
                                confirmButtonText: '複製憑證',
                                type: 'warning',
                                roundButton: true,
                            }
                        )
                            .then(async () => {
                                await navigator.clipboard.writeText(res.token)
                                ElMessage({
                                    type: 'success',
                                    message: '已複製',
                                })
                            })
                            .catch(() => {})
                    }
                })
                .catch(async () => {
                    voteFail.value = true

                    await refreshNuxtData()
                })
        })
        .catch(() => {})

    endLoading(VS.id)
}

const seeToken = async (index: number) => {
    tokenLoading.value[index] = true
    document.body.style.overflowY = 'hidden'

    if (!voteToken.value[index]) {
        const res = (await $fetch(
            '/api/getToken?' + new URLSearchParams({ id: index.toString() })
        )) as unknown as Ballot | null

        if (!res) {
            await ElMessageBox.alert('故無投票憑證', '(尚)未投票', {
                showClose: false,
                confirmButtonText: '確定',
                type: 'error',
            }).catch(() => {})
        } else {
            voteToken.value[index] = res.token
        }
    }

    if (voteToken.value[index]) {
        await ElMessageBox.alert(voteToken.value[index], '投票憑證', {
            confirmButtonText: '複製憑證',
            type: 'success',
            roundButton: true,
        })
            .then(async () => {
                await navigator.clipboard.writeText(voteToken.value[index])
                ElMessage({
                    type: 'success',
                    message: '已複製',
                })
            })
            .catch(() => {})
    }

    tokenLoading.value[index] = false
    document.body.style.overflowY = 'auto'
}

const seeResult = async (index: number) => {
    resultLoading.value[index] = true
    document.body.style.overflowY = 'hidden'

    if (!voteToken.value[index]) {
        const res = (await $fetch(
            '/api/getToken?' + new URLSearchParams({ id: index.toString() })
        )) as unknown as Ballot | null

        if (!res) {
            await ElMessageBox.alert('故無投票憑證', '尚未投票', {
                showClose: false,
                confirmButtonText: '確定',
                type: 'error',
            }).catch(() => {})
        } else {
            voteToken.value[index] = res.token
        }
    }

    if (voteToken.value[index]) {
        await ElMessageBox.alert(voteToken.value[index], '投票憑證', {
            confirmButtonText: '複製憑證',
            type: 'success',
            roundButton: true,
        })
            .then(async () => {
                await navigator.clipboard.writeText(voteToken.value[index])
                ElMessage({
                    type: 'success',
                    message: '已複製',
                })
            })
            .catch(() => {})
    }

    document.body.style.overflowY = 'auto'
    await useRouter().push('/vote/' + index)
    resultLoading.value[index] = false
}

onMounted(async () => {
    setTimeout(async () => {
        if (VS.value === null) {
            await VSRefresh()
        }
    }, 250)
})
</script>
