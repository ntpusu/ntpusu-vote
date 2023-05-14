<template>
    <ElSkeleton
        animated
        :loading="VSPending || data === null"
        class="flex justify-center"
    >
        <template #template>
            <ElSpace alignment="center" wrap class="justify-center">
                <ElSkeletonItem
                    v-for=" in rand(2, 4)"
                    variant="rect"
                    class="!w-[85vw] !rounded-xl sm:!w-[65vw] md:!w-[50vw] lg:!w-[40vw] xl:!w-[35vw] 2xl:!w-[28vw]"
                    :style="{ height: rand(15, 25) + 'rem' }"
                />
            </ElSpace>
        </template>
        <template #default>
            <div v-if="!VSPending && data !== null" class="flex justify-center">
                <ElSpace
                    v-if="data.VS.length"
                    alignment="center"
                    wrap
                    class="justify-center"
                >
                    <ElCard
                        v-for="VSitem in data.VS"
                        :key="VSitem.id"
                        shadow="hover"
                        class="w-[85vw] !rounded-xl sm:w-[65vw] md:w-[50vw] lg:w-[40vw] xl:w-[35vw] 2xl:w-[28vw]"
                    >
                        <template #header>
                            <div class="flex items-center justify-between">
                                <div
                                    class="cursor-default text-lg font-bold sm:text-xl md:text-2xl"
                                >
                                    {{ VSitem.name }}
                                </div>
                                <div
                                    class="flex flex-col justify-end align-middle text-xs sm:text-sm"
                                >
                                    <ClientOnly>
                                        <ElTooltip
                                            placement="right"
                                            :disabled="
                                                Date.now() >
                                                timeCnt(VSitem.endTime)
                                            "
                                        >
                                            <template #content>
                                                <ElCountdown
                                                    v-if="
                                                        Date.now() <
                                                        timeCnt(
                                                            VSitem.startTime
                                                        )
                                                    "
                                                    class="text-center"
                                                    :format="
                                                        chooseFormat(
                                                            VSitem.startTime
                                                        )
                                                    "
                                                    :value="
                                                        timeCnt(
                                                            VSitem.startTime
                                                        )
                                                    "
                                                    value-style="color: white;"
                                                    @finish="VSRefresh()"
                                                >
                                                    <template #title>
                                                        <span
                                                            class="!text-white"
                                                        >
                                                            距離開始還有
                                                        </span>
                                                    </template>
                                                </ElCountdown>
                                                <span v-else class="m-auto">
                                                    已開始
                                                </span>
                                            </template>
                                            <ElTag
                                                round
                                                effect="plain"
                                                :class="{
                                                    'cursor-help':
                                                        Date.now() <=
                                                        timeCnt(VSitem.endTime),
                                                    'cursor-default':
                                                        Date.now() >
                                                        timeCnt(VSitem.endTime),
                                                }"
                                            >
                                                開始:
                                                {{ viewDate(VSitem.startTime) }}
                                            </ElTag>
                                        </ElTooltip>
                                    </ClientOnly>
                                    <div class="h-1 w-full" />
                                    <ClientOnly>
                                        <ElTooltip
                                            placement="right"
                                            :disabled="
                                                Date.now() <
                                                timeCnt(VSitem.startTime)
                                            "
                                        >
                                            <template #content>
                                                <ElCountdown
                                                    v-if="
                                                        Date.now() <=
                                                        timeCnt(VSitem.endTime)
                                                    "
                                                    class="text-center"
                                                    :format="
                                                        chooseFormat(
                                                            VSitem.endTime
                                                        )
                                                    "
                                                    :value="
                                                        timeCnt(VSitem.endTime)
                                                    "
                                                    value-style="color: white;"
                                                    @finish="VSRefresh()"
                                                >
                                                    <template #title>
                                                        <span
                                                            class="!text-white"
                                                        >
                                                            距離結束還有
                                                        </span>
                                                    </template>
                                                </ElCountdown>
                                                <span v-else class="m-auto"
                                                    >已結束</span
                                                >
                                            </template>
                                            <ElTag
                                                round
                                                effect="plain"
                                                :class="{
                                                    'cursor-help':
                                                        Date.now() >=
                                                        timeCnt(
                                                            VSitem.startTime
                                                        ),
                                                    'cursor-default':
                                                        Date.now() <
                                                        timeCnt(
                                                            VSitem.startTime
                                                        ),
                                                }"
                                            >
                                                結束:
                                                {{ viewDate(VSitem.endTime) }}
                                            </ElTag>
                                        </ElTooltip>
                                    </ClientOnly>
                                </div>
                            </div>
                        </template>
                        <div>
                            <h2
                                class="cursor-default pb-5 text-center text-base font-bold sm:text-lg md:text-xl"
                            >
                                候選人名單
                            </h2>
                            <ElSpace
                                direction="vertical"
                                alignment="start"
                                class="!flex content-center"
                                wrap
                            >
                                <div
                                    v-if="VSitem.onlyOne"
                                    class="flex items-center text-sm sm:text-base md:text-lg"
                                >
                                    <ElTag
                                        type="success"
                                        effect="dark"
                                        size="small"
                                        round
                                        class="cursor-default"
                                    >
                                        1
                                    </ElTag>
                                    <div class="ml-2 mr-5">
                                        {{ VSitem.onlyOne }}
                                    </div>
                                </div>
                                <template v-else>
                                    <div
                                        v-for="itemIndex in VSitem.candidates
                                            .length - 1"
                                        :key="itemIndex"
                                        class="flex items-center text-sm sm:text-base md:text-lg"
                                    >
                                        <ElTag
                                            type="success"
                                            effect="dark"
                                            size="small"
                                            round
                                            class="cursor-default"
                                        >
                                            {{ itemIndex }}
                                        </ElTag>
                                        <div class="ml-2 mr-5">
                                            {{
                                                VSitem.candidates[itemIndex - 1]
                                                    .name
                                            }}
                                        </div>
                                    </div>
                                </template>
                            </ElSpace>
                        </div>
                        <ElDivider />
                        <div
                            v-if="Date.now() < timeCnt(VSitem.startTime)"
                            class="flex justify-center"
                        >
                            <ElButton
                                type="danger"
                                class="w-fit !rounded-md"
                                plain
                                loading
                            >
                                <span class="font-bold">尚 未 開 始</span>
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
                                    @open="voteLoading[VSitem.id] = true"
                                    @close="voteLoading[VSitem.id] = false"
                                >
                                    <template #header>
                                        <div class="flex">
                                            <div
                                                class="m-auto flex cursor-default text-lg font-bold sm:text-xl md:text-2xl"
                                            >
                                                {{ VSitem.name }}
                                            </div>
                                            <div class="flex-grow" />
                                            <div
                                                class="m-auto flex cursor-default flex-col items-end pl-10 pr-3 text-xs text-gray-500 md:pl-14 md:pr-6 md:text-sm"
                                            >
                                                <span class="text-gray-500">
                                                    請在下方選擇您要投的選項
                                                </span>
                                                <span class="text-red-500">
                                                    投出選票後無法刪除或變更
                                                </span>
                                            </div>
                                        </div>
                                    </template>
                                    <ElDivider class="!-mt-5 !mb-0" />
                                    <div
                                        class="mx-5 flex flex-col items-center align-middle"
                                    >
                                        <span
                                            v-if="VSitem.onlyOne"
                                            class="my-2 cursor-default text-base font-bold text-black sm:my-3 sm:text-lg md:my-4 md:text-xl"
                                        >
                                            同意{{ VSitem.onlyOne }}當選嗎？
                                        </span>
                                        <span
                                            v-else
                                            class="my-2 cursor-default text-base font-bold text-black sm:my-3 sm:text-lg md:my-4 md:text-xl"
                                        >
                                            請選擇要投的候選人
                                        </span>
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
                                                    class="max-w-full cursor-default whitespace-pre-wrap break-all"
                                                >
                                                    {{ candidate.name }}
                                                </span>
                                            </ElRadio>
                                        </ElRadioGroup>
                                    </div>
                                    <ElDivider border-style="dashed" />
                                    <div class="flex flex-col items-center">
                                        <span
                                            class="-mt-2 mb-3 cursor-default text-sm text-gray-600"
                                        >
                                            目前登入的學號是：{{
                                                useAuth().data.value?.user?.email?.substring(
                                                    1,
                                                    10
                                                )
                                            }}
                                        </span>
                                        <ElButton
                                            type="primary"
                                            class="w-fit !rounded-md"
                                            @click="voteConfirm(VSitem)"
                                            plain
                                        >
                                            <span class="font-bold"
                                                >投 出 選 票</span
                                            >
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
                                    <span class="font-bold">結 果</span>
                                </ElButton>
                            </div>
                            <div v-else class="flex justify-center">
                                <ElButton
                                    type="primary"
                                    class="w-fit !rounded-md"
                                    :disabled="
                                        data.tokens[VSitem.id] !== undefined
                                    "
                                    @click="voteVisible[VSitem.id] = true"
                                    plain
                                    :loading="voteLoading[VSitem.id]"
                                >
                                    <span
                                        v-if="
                                            data.tokens[VSitem.id] === undefined
                                        "
                                        class="font-bold"
                                    >
                                        投 票
                                    </span>
                                    <span v-else class="font-bold"
                                        >已 投 票</span
                                    >
                                </ElButton>
                                <ElButton
                                    type="info"
                                    class="w-fit !rounded-md"
                                    :disabled="
                                        data.tokens[VSitem.id] === undefined
                                    "
                                    @click="seeToken(VSitem.id)"
                                    plain
                                    :loading="tokenLoading[VSitem.id]"
                                >
                                    <span
                                        v-if="
                                            data.tokens[VSitem.id] !== undefined
                                        "
                                        class="font-bold"
                                    >
                                        查 看 憑 證
                                    </span>
                                    <span v-else class="font-bold"
                                        >尚 未 投 票</span
                                    >
                                </ElButton>
                            </div>
                        </div>
                    </ElCard>
                </ElSpace>
                <ElResult v-else title="沒有投票" icon="info" class="mt-16">
                    <template #sub-title>
                        若有疑問請隨時<NuxtLink
                            to="https://www.facebook.com/NTPUSU"
                            target="_blank"
                            class="whitespace-pre-wrap break-all font-bold text-blue-500 hover:text-blue-800 hover:underline"
                            >聯繫我們</NuxtLink
                        >
                    </template>
                </ElResult>
            </div>
        </template>
    </ElSkeleton>
    <ClientOnly>
        <ElDialog
            v-model="voteFail"
            align-center
            class="min-w-fit !rounded-lg px-5"
            width="30%"
        >
            <template #header>
                <div class="text-2xl font-bold text-red-500">投票失敗</div>
            </template>
            <div class="px-5 pb-3 text-lg">
                可能原因：<br />
                1. 未登入<br />
                2. 網路連線斷了<br />
                3. 未在投票時間內投票<br />
                4. 操作過於頻繁<br />
                若有疑問請聯繫<NuxtLink
                    to="https://www.facebook.com/NTPUSU"
                    target="_blank"
                    class="whitespace-pre-wrap break-all font-bold text-blue-400 hover:text-blue-500 hover:underline"
                    >學生會</NuxtLink
                >
            </div>
        </ElDialog>
    </ClientOnly>
</template>

<script lang="ts" setup>
import { rand } from '@vueuse/shared'
import type { Action } from 'element-plus'
import { useReCaptcha } from 'vue-recaptcha-v3'

definePageMeta({
    title: '投票',
})

const {
    data,
    pending: VSPending,
    refresh: VSRefresh,
} = await useLazyFetch('/api/voterSession')

const viewDate = (time: string | number | Date) => {
    return new Date(time).toLocaleString(undefined, {
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

const chooseFormat = (time: string | number | Date) => {
    if (timeCnt(time) - Date.now() >= 24 * 60 * 60 * 1000)
        return 'D 天 H 小時 m 分 s 秒'
    else if (timeCnt(time) - Date.now() >= 60 * 60 * 1000)
        return 'H 小時 m 分 s 秒'
    else if (timeCnt(time) - Date.now() >= 60 * 1000) return 'm 分 s 秒'
    else return 's 秒'
}

const voteFail = ref(false)

const voteVisible: Ref<boolean[]> = ref([])
const voteData: Ref<number[]> = ref([])
const voteLoading: Ref<boolean[]> = ref([])
const tokenLoading: Ref<boolean[]> = ref([])
const resultLoading: Ref<boolean[]> = ref([])

const recaptchaInstance = useReCaptcha()

const recaptcha = async (action: string) => {
    await recaptchaInstance?.recaptchaLoaded()
    const token = await recaptchaInstance?.executeRecaptcha(action)

    return token
}

const voteConfirm = async (VS: {
    id: number
    name: string
    candidates: {
        id: number
        name: string
    }[]
}) => {
    if (!voteData.value[VS.id]) {
        ElMessage({
            type: 'warning',
            message: '請選擇候選人',
        })
        return
    }

    voteVisible.value[VS.id] = false
    setTimeout(() => {
        voteLoading.value[VS.id] = true
    }, 1)

    const candidate = VS.candidates.find(
        (item: { id: number }) => item.id === voteData.value[VS.id]
    )!.name

    await ElMessageBox.confirm(
        '投出選票後無法刪除或變更',
        '確定要投給「' + candidate + '」嗎？',
        {
            confirmButtonText: '確 定',
            cancelButtonText: '取 消',
            type: 'warning',
        }
    )
        .then(async () => {
            const response = await recaptcha('vote')

            const { data } = (await useFetch('/api/recaptcha', {
                method: 'POST',
                body: JSON.stringify({ response }),
            })) as unknown as {
                data: {
                    value: {
                        action: string
                        challenge_ts: string
                        hostname: string
                        score: number
                        success: boolean
                    }
                }
            }

            if (data.value.action != 'vote' || data.value.score <= 0.6) {
                ElMessage.error('ReCatCha驗證失敗，請稍後再試')
                return
            }

            await useFetch('/api/vote', {
                method: 'POST',
                body: JSON.stringify({
                    VSId: VS.id,
                    candidateId: voteData.value[VS.id],
                }),
            })
                .then(async ({ data: res }) => {
                    if (res.value!.vote) {
                        await ElMessageBox.alert(
                            '憑證：' + res.value!.token,
                            '投票成功',
                            {
                                confirmButtonText: '複製憑證',
                                type: 'success',
                                roundButton: true,
                            }
                        )
                            .then(async () => {
                                await navigator.clipboard.writeText(
                                    res.value!.token
                                )
                                ElMessage({
                                    type: 'success',
                                    message: '已複製',
                                })
                            })
                            .catch(() => {})
                    } else {
                        await ElMessageBox.alert(
                            '憑證：' + res.value!.token,
                            '不可重複投票',
                            {
                                confirmButtonText: '複製憑證',
                                type: 'warning',
                                roundButton: true,
                            }
                        )
                            .then(async () => {
                                await navigator.clipboard.writeText(
                                    res.value!.token
                                )
                                ElMessage({
                                    type: 'success',
                                    message: '已複製',
                                })
                            })
                            .catch(() => {})
                    }
                })
                .catch(() => {
                    voteFail.value = true
                })
                .finally(async () => {
                    await VSRefresh()
                })
        })
        .catch(() => {
            ElMessage({
                type: 'info',
                message: '取消投票',
            })
        })

    voteLoading.value[VS.id] = false
}

const seeToken = async (index: number) => {
    tokenLoading.value[index] = true

    await ElMessageBox.confirm(data.value!.tokens[index], '投票憑證', {
        cancelButtonText: '複製憑證',
        cancelButtonClass: 'el-button--success',
        confirmButtonText: '確 定',
        distinguishCancelAndClose: true,
        type: 'success',
        roundButton: true,
    }).catch(async (action: Action) => {
        if (action === 'cancel') {
            await navigator.clipboard.writeText(data.value!.tokens[index])
            ElMessage({
                type: 'success',
                message: '已複製',
            })
        }
    })

    tokenLoading.value[index] = false
}

const seeResult = async (index: number) => {
    const response = await recaptcha('result')

    const { data: res } = (await useFetch('/api/recaptcha', {
        method: 'POST',
        body: JSON.stringify({ response }),
    })) as unknown as {
        data: {
            value: {
                action: string
                challenge_ts: string
                hostname: string
                score: number
                success: boolean
            }
        }
    }

    if (res.value.action != 'vote' || res.value.score <= 0.6) {
        ElMessage.error('ReCatCha驗證失敗，請稍後再試')
        return
    }

    resultLoading.value[index] = true

    if (data.value!.tokens[index]) {
        await ElMessageBox.confirm(data.value!.tokens[index], '投票憑證', {
            cancelButtonText: '複製憑證',
            cancelButtonClass: 'el-button--success',
            confirmButtonText: '確 定',
            distinguishCancelAndClose: true,
            type: 'success',
            roundButton: true,
        }).catch(async (action: Action) => {
            if (action === 'cancel') {
                await navigator.clipboard.writeText(data.value!.tokens[index])
                ElMessage({
                    type: 'success',
                    message: '已複製',
                })
            }
        })
    } else {
        await ElMessageBox.alert('無投票憑證', '未投票', {
            showClose: false,
            confirmButtonText: '確 定',
            type: 'error',
        }).catch(() => {})
    }

    resultLoading.value[index] = false
    await useRouter().push('/vote/' + index)
}

const checkData = () => {
    setTimeout(async () => {
        if (VSPending.value) checkData()
        else if (!data.value && useRoute().path == '/vote') {
            ElMessage({
                type: 'error',
                message: '操作過於頻繁或不在投票人名單內',
            })

            setTimeout(() => {
                ElMessage({
                    type: 'warning',
                    message: '若有疑問請聯繫學生會',
                })
            }, 1500)

            setTimeout(() => {
                ElMessage({
                    type: 'info',
                    message: '將自動返回首頁',
                })
            }, 3000)

            setTimeout(async () => {
                if (useRoute().path == '/vote') await useRouter().push('/')
            }, 4500)
        }
    }, 100)
}

onMounted(() => {
    checkData()
})
</script>
