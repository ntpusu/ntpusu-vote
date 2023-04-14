<template>
    <div v-if="!VSPending && VS !== null">
        <div class="flex justify-center">
            <ElCard class="w-full md:w-5/6 xl:w-2/3 2xl:w-1/2">
                <div class="flex justify-around">
                    <div class="flex items-center text-center">
                        <h1 class="text-2xl font-bold">{{ VS.name }}</h1>
                    </div>
                    <ElStatistic
                        class="text-center"
                        title="投票人數"
                        :value="voteCnt()"
                    >
                        <template #suffix>人</template>
                    </ElStatistic>
                </div>
                <ElDivider />
                <div class="flex justify-around">
                    <div class="text-center">
                        <h1 class="text-lg">開始時間</h1>
                        <p class="text-sm">{{ viewDate(VS.startTime) }}</p>
                    </div>
                    <div class="text-center">
                        <h1 class="text-lg">結束時間</h1>
                        <p class="text-sm">{{ viewDate(VS.endTime) }}</p>
                    </div>
                </div>
                <ElDivider />
                <div class="text-center">
                    <h1 class="pb-6 text-xl font-bold tracking-[0.5rem]">
                        候選人
                    </h1>
                    <ElSpace :size="10" class="justify-center" wrap>
                        <ElCard
                            v-for="(candidate, index) in VS.candidates"
                            :shadow="
                                candidate.ballots.length === winnerCnt()
                                    ? 'always'
                                    : 'never'
                            "
                            :class="{
                                '!bg-rose-100':
                                    candidate.ballots.length === winnerCnt(),
                            }"
                            :key="index"
                        >
                            <div class="px-6 text-center">
                                <h1 class="text-xl">{{ candidate.name }}</h1>
                            </div>
                            <ElDivider />
                            <ElStatistic
                                class="text-center"
                                title="票數"
                                :value="candidate.ballots.length"
                            >
                                <template #suffix>票</template>
                            </ElStatistic>
                            <ElDivider />
                            <ElProgress
                                type="dashboard"
                                :percentage="
                                    voteCnt() === 0
                                        ? 0
                                        : (candidate.ballots.length * 100) /
                                          voteCnt()
                                "
                                :color="
                                    candidate.ballots.length === winnerCnt()
                                        ? '#f56c6c'
                                        : '#409eff'
                                "
                            >
                                <template #default="{ percentage }">
                                    <ElStatistic
                                        class="text-center"
                                        title="得票率"
                                        :value="percentage"
                                    >
                                        <template #suffix>%</template>
                                    </ElStatistic>
                                </template>
                            </ElProgress>
                        </ElCard>
                    </ElSpace>
                </div>
            </ElCard>
        </div>
    </div>
    <ElSkeleton v-else animated />
</template>

<script lang="ts" setup>
import type { VoteSession, Candidate, Ballot } from '.prisma/client'
import type { AsyncDataExecuteOptions } from 'nuxt/dist/app/composables/asyncData'

const { id } = useRoute().params as { id: string }

const {
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = (await useFetch(
    '/api/getResult?' + new URLSearchParams({ id })
)) as unknown as {
    data: globalThis.Ref<
        | (VoteSession & {
              candidates: (Candidate & {
                  ballots: Ballot[]
              })[]
          })
        | null
    >
    pending: boolean
    refresh: (opts?: AsyncDataExecuteOptions | undefined) => Promise<void>
}

definePageMeta({
    title: '投票結果',
})

const viewDate = (time: Date) => {
    return new Date(time).toLocaleString()
}

const voteCnt = () => {
    if (VS.value == null) return 0

    return VS.value.candidates.reduce((acc, cur) => {
        return acc + cur.ballots.length
    }, 0)
}

const winnerCnt = () => {
    if (VS.value == null) return 0

    return VS.value.candidates.reduce((acc, cur) => {
        return acc > cur.ballots.length ? acc : cur.ballots.length
    }, 0)
}

onMounted(async () => {
    setTimeout(async () => {
        if (VS.value == null) {
            await VSRefresh()
        }
    }, 250)

    setTimeout(async () => {
        if (VS.value == null) {
            await useRouter().push('/404')
        }
    }, 1000)
})
</script>
