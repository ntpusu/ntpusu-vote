<template>
    <div class="flex justify-center">
        <ElCard
            v-if="!VSPending && VS !== null"
            class="w-full md:w-5/6 xl:w-2/3 2xl:w-1/2"
        >
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
                    <ElText tag="b">{{ viewDate(VS.startTime) }}</ElText>
                </div>
                <div class="text-center">
                    <h1 class="text-lg">結束時間</h1>
                    <ElText tag="b">{{ viewDate(VS.endTime) }}</ElText>
                </div>
            </div>
            <ElDivider />
            <div class="text-center">
                <h1 class="pb-6 text-xl font-bold">候 選 人</h1>
                <ElSpace class="justify-center" wrap>
                    <ElCard
                        v-for="(candidate, index) in VS.candidates"
                        :shadow="
                            candidate._count.ballots === winnerCnt()
                                ? 'always'
                                : 'never'
                        "
                        :class="{
                            '!bg-green-50':
                                candidate._count.ballots === winnerCnt(),
                        }"
                        :key="index"
                        class="max-w-[12rem] md:max-w-[15rem] xl:max-w-[18rem]"
                    >
                        <div class="px-6 text-center">
                            <h1 class="text-xl">{{ candidate.name }}</h1>
                        </div>
                        <ElDivider />
                        <ElBadge
                            :hidden="candidate._count.ballots !== winnerCnt()"
                            value="#最高票"
                        >
                            <ElStatistic
                                class="m-1 text-center"
                                title="票數"
                                :value="candidate._count.ballots"
                            >
                                <template #suffix>票</template>
                            </ElStatistic>
                        </ElBadge>
                        <ElDivider />
                        <ElProgress
                            type="dashboard"
                            :percentage="
                                voteCnt() === 0
                                    ? 0
                                    : (candidate._count.ballots * 100) /
                                      voteCnt()
                            "
                            :color="
                                candidate._count.ballots === winnerCnt()
                                    ? '#67C23A'
                                    : '#409EFF'
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
        <ElSkeleton v-else class="flex justify-center" animated>
            <template #template>
                <ElSkeletonItem
                    variant="rect"
                    class="!h-[100vh] !w-full md:!w-5/6 xl:!w-2/3 2xl:!w-1/2"
                />
            </template>
        </ElSkeleton>
    </div>
</template>

<script lang="ts" setup>
const { id } = useRoute().params as { id: string }

const { data: VS, pending: VSPending } = await useLazyFetch('/api/getResult', {
    key: id,
    query: { id },
})

definePageMeta({
    title: '結果',
})

const viewDate = (time: string | number | Date) => {
    return new Date(time).toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const voteCnt = () => {
    if (!VS.value) return 0

    return VS.value.candidates.reduce((acc, cur) => {
        return acc + cur._count.ballots
    }, 0)
}

const winnerCnt = () => {
    if (!VS.value) return 0

    return VS.value.candidates.reduce((acc, cur) => {
        return acc > cur._count.ballots ? acc : cur._count.ballots
    }, 0)
}

const checkData = () => {
    setTimeout(async () => {
        if (VSPending.value) checkData()
        else if (!VS.value && useRoute().path == '/vote/' + id)
            await useRouter().push('/404')
    }, 100)
}

onMounted(() => {
    checkData()
})
</script>
