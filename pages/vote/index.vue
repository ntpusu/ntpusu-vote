<template>
    <ElSpace v-if="!VSPending" class="justify-center" wrap>
        <ElCard
            v-for="VSitem in VS"
            :key="VSitem.id"
            shadow="hover"
            class="w-[25rem]"
        >
            <template #header>
                <ElSpace class="!flex justify-between">
                    <div class="flex-wrap text-xl font-bold">
                        {{ VSitem.name }}
                    </div>
                    <div>
                        <div class="w-44 text-[0.7rem] leading-4">
                            開始：{{ viewDate(VSitem.startTime) }}
                        </div>
                        <div class="w-44 text-[0.7rem] leading-4">
                            截止：{{ viewDate(VSitem.endTime) }}
                        </div>
                    </div>
                </ElSpace>
            </template>
            <div v-if="Date.now() < timeCnt(VSitem.startTime)">
                <div
                    v-for="(candidate, itemIndex) in VSitem.candidates"
                    :key="itemIndex"
                >
                    {{ candidate.name }}
                </div>
            </div>
            <div v-else>
                <ElForm :model="voteData">
                    <ElRadioGroup
                        class="!grid justify-start"
                        v-model="voteData[VSitem.id]"
                        :disabled="Date.now() > timeCnt(VSitem.endTime)"
                    >
                        <ElRadio
                            v-for="(candidate, itemIndex) in VSitem.candidates"
                            :key="itemIndex"
                            :label="candidate.id"
                            border
                            class="!mr-0 mb-2"
                            >{{ candidate.name }}
                        </ElRadio>
                    </ElRadioGroup>
                    <el-divider border-style="dashed" />
                    <div
                        v-if="Date.now() > timeCnt(VSitem.endTime)"
                        class="px-32"
                    >
                        <NuxtLink
                            class="inline-flex w-full justify-center rounded-md bg-green-600 px-6 py-1.5 text-sm tracking-widest text-white hover:bg-green-500"
                            @click="seeToken(VSitem.id)"
                            :to="'/vote/' + VSitem.id"
                        >
                            結果
                        </NuxtLink>
                    </div>
                    <div v-else class="flex px-16">
                        <ElButton
                            type="primary"
                            class="w-full !rounded-md tracking-widest"
                            @click="voteConfirm(VSitem)"
                            >投票
                        </ElButton>
                        <ElButton
                            type="success"
                            class="w-full !rounded-md tracking-widest"
                            @click="seeToken(VSitem.id)"
                            >查看憑證
                        </ElButton>
                    </div>
                </ElForm>
            </div>
        </ElCard>
    </ElSpace>
    <ElEmpty v-else description="loading......" />
</template>

<script lang="ts" setup>
import type { Ballot } from '@prisma/client'
import { Ref } from 'vue'
const {
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = await useLazyFetch('/api/voterSession')

const newDate = (time: string | number | Date) => {
    return new Date(time)
}

const viewDate = (time: any) => {
    return newDate(time).toLocaleString()
}

const timeCnt = (time: any) => {
    return newDate(time).getTime()
}

const voteData: Ref<number[]> = ref([])
const voteToken: Ref<string[]> = ref([])

const voteConfirm = async (VS: { id: number; candidates: any[] }) => {
    if (!voteData.value[VS.id]) {
        ElMessage({
            type: 'warning',
            message: '請選擇候選人',
        })
        return
    }

    const candidate = VS.candidates.find(
        (item: { id: number }) => item.id === voteData.value[VS.id]
    )?.name

    await ElMessageBox.confirm(
        '確定要投給「' + candidate + '」嗎？',
        '再次確認',
        {
            confirmButtonText: '確定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    )
        .then(async () => {
            await $fetch('/api/vote', {
                method: 'POST',
                body: JSON.stringify({
                    candidateId: voteData.value[VS.id],
                }),
            }).then(async (res) => {
                if (res.result) {
                    if (res.vote!) {
                        voteToken.value[VS.id] = res.token!
                        await ElMessageBox.alert(
                            '憑證：' + res.token!,
                            '投票成功',
                            {
                                confirmButtonText: '複製憑證',
                                type: 'success',
                                roundButton: true,
                            }
                        ).then(async () => {
                            await navigator.clipboard.writeText(res.token!)
                            ElMessage({
                                type: 'success',
                                message: '已複製',
                            })
                        })
                    } else {
                        voteToken.value[VS.id] = res.token!
                        await ElMessageBox.alert(
                            '憑證：' + res.token!,
                            '不可重複投票',
                            {
                                confirmButtonText: '複製憑證',
                                type: 'warning',
                                roundButton: true,
                            }
                        ).then(async () => {
                            await navigator.clipboard.writeText(res.token!)
                            ElMessage({
                                type: 'success',
                                message: '已複製',
                            })
                        })
                    }
                } else {
                    await ElMessageBox.alert('投票失敗', '錯誤', {
                        confirmButtonText: '確定',
                        type: 'error',
                    })
                }
            })
        })
        .catch(() => {})
}

const seeToken = async (index: number) => {
    if (!voteToken.value[index]) {
        const res = (await $fetch(
            '/api/getToken?' + new URLSearchParams({ id: index.toString() })
        )) as Ballot | null

        if (!res) {
            await ElMessageBox.alert('故沒有投票憑證', '未投票', {
                confirmButtonText: '確定',
                type: 'error',
            })
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
}

onMounted(async () => {
    setTimeout(async () => {
        if (VS.value === null) {
            await VSRefresh()
        }
    }, 500)
})
</script>
