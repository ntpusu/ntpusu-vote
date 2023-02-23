<template>
    <el-space v-if="!VSPending" class="justify-center" wrap>
        <el-card
            v-for="(VSitem, index) in VS"
            :key="index"
            shadow="hover"
            class="w-[25rem]"
        >
            <template #header>
                <el-space class="!flex justify-between">
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
                </el-space>
            </template>
            <div v-if="timeCnt(VSitem.startTime) > Date.now()">
                <div
                    v-for="(candidate, itemIndex) in VSitem.candidates"
                    :key="itemIndex"
                >
                    {{ candidate.name }}
                </div>
            </div>
            <div v-else>
                <el-form :model="voteData">
                    <el-radio-group
                        class="!grid justify-start"
                        v-model="voteData.selected[index]"
                        :disabled="
                            checkVote(VSitem.name, index) ||
                            timeCnt(VSitem.endTime) < Date.now()
                        "
                    >
                        <el-radio
                            v-for="(candidate, itemIndex) in VSitem.candidates"
                            :key="itemIndex"
                            :label="candidate.id"
                            border
                            class="!mr-0 mb-2"
                            >{{ candidate.name }}
                        </el-radio>
                    </el-radio-group>
                    <el-divider border-style="dashed" />
                    <div class="px-32">
                        <NuxtLink
                            v-if="timeCnt(VSitem.endTime) < Date.now()"
                            class="inline-flex w-full justify-center rounded-md bg-green-600 px-6 py-1.5 text-sm tracking-widest text-white hover:bg-green-500"
                            @click="showToken(index)"
                            :to="'/vote/' + VSitem.id"
                        >
                            結果
                        </NuxtLink>
                        <el-button
                            v-else-if="!voteData.disable[index]"
                            type="primary"
                            class="w-full !rounded-md tracking-widest"
                            @click="voteConfirm(index)"
                            >投票
                        </el-button>
                        <el-button
                            v-else
                            type="primary"
                            class="w-full !rounded-md tracking-widest"
                            @click="seeToken(index)"
                            >已投票
                        </el-button>
                    </div>
                </el-form>
            </div>
        </el-card>
    </el-space>
    <el-empty v-else description="loading......" />
</template>

<script lang="ts" setup>
import type { Candidate } from '@prisma/client'

definePageMeta({
    middleware: ['auth'],
})

const {
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = await useLazyFetch('/api/VsCa')

const newDate = (time: Date) => {
    return new Date(time)
}

const viewDate = (time: Date) => {
    return newDate(time).toLocaleString()
}

const timeCnt = (time: Date) => {
    return newDate(time).getTime()
}

const voteData = reactive<{
    selected: number[]
    disable: boolean[]
    token: string[]
}>({ selected: [], disable: [], token: [] })

const checkVote = (title: string, index: number) => {
    $fetch('/api/uniBa?' + new URLSearchParams({ title })).then((res: any) => {
        if (res.respond) {
            voteData.selected[index] = res.ballot.candidateId
            voteData.disable[index] = true
            voteData.token[index] = res.ballot.token
        } else {
            voteData.disable[index] = false
        }
    })

    return voteData.disable[index]
}

const voteConfirm = async (index: number) => {
    if (
        voteData.selected[index] !== undefined &&
        voteData.selected[index] !== null
    ) {
        const candidate = await $fetch(
            '/api/uniCa?' +
                new URLSearchParams({ id: voteData.selected[index].toString() })
        )

        ElMessageBox.confirm(
            '確定要投給「' + (candidate as Candidate | null)?.name + '」嗎？',
            '再次確認',
            {
                confirmButtonText: '確定',
                cancelButtonText: '取消',
                type: 'warning',
            }
        )
            .then(() => {
                $fetch('/api/vote', {
                    method: 'POST',
                    body: JSON.stringify({
                        candidateId: voteData.selected[index],
                    }),
                }).then((res: any) => {
                    if (res.respond) {
                        voteData.disable[index] = true
                        voteData.token[index] = res.token
                        ElMessageBox.alert('憑證：' + res.token, '投票成功', {
                            confirmButtonText: '複製憑證',
                            type: 'success',
                            roundButton: true,
                        }).then(() => {
                            navigator.clipboard.writeText(res.token)
                            ElMessage({
                                type: 'success',
                                message: '已複製',
                            })
                        })
                    } else {
                        ElMessageBox.alert(
                            '投票憑證：' + res.token,
                            '不可重複投票',
                            {
                                confirmButtonText: '確定',
                                type: 'error',
                            }
                        )
                    }
                })
            })
            .catch(() => {
                ElMessage({
                    type: 'info',
                    message: '已取消投票',
                })
            })
    }
}

const seeToken = (index: number) => {
    ElMessageBox.alert(voteData.token[index], '投票憑證', {
        confirmButtonText: '複製',
        type: 'success',
        roundButton: true,
    }).then(() => {
        navigator.clipboard.writeText(voteData.token[index])
        ElMessage({
            type: 'success',
            message: '已複製',
        })
    })
}

const showToken = (index: number) => {
    if (voteData.disable[index] === true) {
        ElMessageBox.alert(voteData.token[index], '投票憑證', {
            confirmButtonText: '複製',
            type: 'success',
            roundButton: true,
        }).then(() => {
            navigator.clipboard.writeText(voteData.token[index])
            ElMessage({
                type: 'success',
                message: '已複製',
            })
        })
    } else {
        ElMessageBox.alert('未投票，故無投票憑證', '投票憑證', {
            confirmButtonText: '確定',
            type: 'error',
            roundButton: true,
        })
    }
}

onMounted(async () => {
    setTimeout(() => {
        if (VS.value === null) {
            VSRefresh()
        }
    }, 1000)
})
</script>
