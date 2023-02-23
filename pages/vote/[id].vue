<template>
    <div v-if="!VSPending">
        <el-carousel
            v-if="timeCnt(VS!.endTime) < Date.now()"
            :autoplay="false"
            height="80vh"
            indicator-position="none"
            arrow="always"
            class="py-[3vm]"
        >
            <el-carousel-item
                v-for="(Candidate, index) in VS!.candidates"
                :key="index"
            >
                <div class="flex">
                    <div class="pl-[1vw] text-base font-bold sm:text-lg">
                        項目名稱：{{ VS!.name }}
                    </div>
                    <div class="flex-grow" />
                    <div class="text-base font-bold sm:text-lg">
                        候選人：{{ Candidate.name }}
                    </div>
                    <div class="flex-grow" />
                    <div class="pr-[3vw]">
                        共&nbsp;{{ Candidate.ballots.length }}&nbsp;票
                    </div>
                </div>
                <el-divider />
                <div class="h-[65vh] overflow-y-auto">
                    <div
                        v-for="(Ballot, index) in Candidate.ballots"
                        :key="index"
                        class="flex justify-center px-[4vw]"
                    >
                        <div>{{ index + 1 }}.&nbsp;</div>
                        <div class="break-all">{{ Ballot.token }}</div>
                    </div>
                </div>
            </el-carousel-item>
        </el-carousel>
    </div>
    <el-empty v-else description="loading......" />
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['auth', 'back-to-vote'],
})

const { id } = useRoute().params as { id: string }

const {
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = (await useLazyFetch(
    '/api/uniVsCaBa?' + new URLSearchParams({ id })
)) as unknown as {
    data: {
        id: string
        name: string
        endTime: Date
        candidates: {
            id: string
            name: string
            ballots: {
                token: string
            }[]
        }[]
    } | null
    pending: boolean
    refresh: () => void
}

const newDate = (time: Date) => {
    return new Date(time)
}

const viewDate = (time: Date) => {
    return newDate(time).toLocaleString()
}

const timeCnt = (time: Date) => {
    return newDate(time).getTime()
}

onMounted(async () => {
    setTimeout(() => {
        if (VS === null) {
            VSRefresh()
        }
    }, 1000)
})
</script>
