<template>
    <ElSpace v-if="!VSPending && VS !== null" class="justify-center" wrap>
        <ElCard
            v-for="VSitem in VS"
            :key="VSitem.id"
            shadow="hover"
            class="w-[22rem] sm:w-96"
        >
            <template #header>
                <div class="flex items-center justify-between">
                    <div class="text-lg font-bold sm:text-xl">
                        {{ VSitem.name }}
                    </div>
                    <div
                        class="flex w-44 flex-wrap justify-end align-middle text-[0.5rem] leading-4 sm:text-[0.7rem]"
                    >
                        開始：{{ viewDate(VSitem.startTime) }}
                        <br />
                        結束：{{ viewDate(VSitem.endTime) }}
                    </div>
                </div>
            </template>
            <div>
                <h2 class="pb-5 text-center text-base font-bold sm:text-lg">
                    候選人名單
                </h2>
                <div
                    v-for="(candidate, itemIndex) in VSitem.candidates"
                    :key="itemIndex"
                    class="flex items-center px-10 py-2 text-sm sm:text-base"
                >
                    <ElTag type="warning" effect="dark">{{
                        itemIndex + 1
                    }}</ElTag>
                    <span>&nbsp;&nbsp;</span>
                    {{ candidate.name }}
                </div>
            </div>
            <ElDivider />
            <div
                v-if="Date.now() < timeCnt(VSitem.startTime)"
                class="px-24 sm:px-28"
            >
                <ElButton
                    type="danger"
                    class="w-full !rounded-md"
                    auto-insert-space
                    plain
                    loading
                >
                    尚未開始
                </ElButton>
            </div>
            <div v-else>
                <ClientOnly>
                    <ElDialog
                        :title="VSitem.name"
                        :center="true"
                        v-model="voteVisible[VSitem.id]"
                        width="30%"
                        class="px-5"
                        @close="voteLoading[VSitem.id] = false"
                    >
                        <ElRadioGroup
                            class="!grid justify-start"
                            v-model="voteData[VSitem.id]"
                        >
                            <ElRadio
                                v-for="(
                                    candidate, itemIndex
                                ) in VSitem.candidates"
                                :key="itemIndex"
                                :label="candidate.id"
                                border
                                class="!mr-0 mb-2"
                            >
                                {{ candidate.name }}
                            </ElRadio>
                        </ElRadioGroup>
                        <ElDivider border-style="dashed" />
                        <ElButton
                            type="primary"
                            class="w-full !rounded-md"
                            @click="voteConfirm(VSitem)"
                            auto-insert-space
                            plain
                        >
                            投票
                        </ElButton>
                    </ElDialog>
                </ClientOnly>
                <div
                    v-if="Date.now() > timeCnt(VSitem.endTime)"
                    class="px-28 sm:px-32"
                >
                    <ElButton
                        type="success"
                        class="w-full !rounded-md"
                        @click="
                            seeToken(VSitem.id).then(() => {
                                useRouter().push('/vote/' + VSitem.id)
                            })
                        "
                        auto-insert-space
                        plain
                    >
                        結果
                    </ElButton>
                </div>
                <div v-else class="flex px-16">
                    <ElButton
                        type="primary"
                        class="w-full !rounded-md tracking-widest"
                        :disabled="voteToken[VSitem.id] !== undefined"
                        @click="
                            voteVisible[VSitem.id] = voteLoading[
                                VSitem.id
                            ] = true
                        "
                        auto-insert-space
                        plain
                        :loading="voteLoading[VSitem.id]"
                    >
                        投票
                    </ElButton>
                    <ElButton
                        type="info"
                        class="w-full !rounded-md tracking-widest"
                        @click="seeToken(VSitem.id)"
                        auto-insert-space
                        plain
                        :loading="tokenLoading[VSitem.id]"
                    >
                        查看憑證
                    </ElButton>
                </div>
            </div>
        </ElCard>
    </ElSpace>
    <ElSpace v-else class="justify-center" wrap>
        <ElSkeleton v-for="index in 4" animated>
            <template #template>
                <ElSkeletonItem variant="rect" class="!h-20 !w-[25rem]" />
            </template>
        </ElSkeleton>
    </ElSpace>
</template>

<script lang="ts" setup>
import type { Ballot, Candidate } from '@prisma/client'

definePageMeta({
    title: '投票',
})

const {
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = await useLazyFetch('/api/voterSession')

const viewDate = (time: string | number | Date) => {
    return new Date(time).toLocaleString()
}

const timeCnt = (time: string | number | Date) => {
    return new Date(time).getTime()
}

const voteVisible: Ref<boolean[]> = ref([])
const voteData: Ref<number[]> = ref([])
const voteToken: Ref<string[]> = ref([])
const tokenLoading: Ref<boolean[]> = ref([])
const voteLoading: Ref<boolean[]> = ref([])

const voteConfirm = async (VS: { id: number; candidates: Candidate[] }) => {
    if (!voteData.value[VS.id]) {
        ElMessage({
            type: 'warning',
            message: '請選擇候選人',
        })
        return
    }

    voteVisible.value[VS.id] = false
    setTimeout(async () => {
        voteLoading.value[VS.id] = true
    }, 10)

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
            inputPattern: /^\d{1,9}$/,
            inputErrorMessage: '學號格式錯誤',
        }
    )
        .then(async ({ value }) => {
            await $fetch('/api/vote', {
                method: 'POST',
                body: JSON.stringify({
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
                        ).then(async () => {
                            await navigator.clipboard.writeText(res.token)
                            ElMessage({
                                type: 'success',
                                message: '已複製',
                            })
                        })
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
                        ).then(async () => {
                            await navigator.clipboard.writeText(res.token)
                            ElMessage({
                                type: 'success',
                                message: '已複製',
                            })
                        })
                    }
                })
                .catch(async () => {
                    await ElMessageBox.alert(
                        '可能原因：1. 網路連線斷了, 2. 未登入, 3. 學號輸入錯誤, 4. 未在投票時間內投票',
                        '投票失敗',
                        {
                            confirmButtonText: '確定',
                            type: 'error',
                        }
                    )

                    await refreshNuxtData()
                })
        })
        .catch(() => {})

    voteLoading.value[VS.id] = false
}

const seeToken = async (index: number) => {
    tokenLoading.value[index] = true

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

    tokenLoading.value[index] = false
}

onMounted(async () => {
    setTimeout(async () => {
        if (VS.value === null) {
            await VSRefresh()
        }
    }, 500)
})
</script>
