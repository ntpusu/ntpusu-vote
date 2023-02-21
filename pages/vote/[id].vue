<template>
    <div v-if="!VSPending" class="overflow-x-scroll sm:overflow-x-auto">
        <el-space
            v-if="timeCnt(VS!.endTime) < Date.now()"
            class="justify-center"
        >
            <el-card
                v-for="(Candidate, index) in VS!.candidates"
                :key="index"
                shadow="hover"
                class="w-96"
            >
                <template #header>
                    <div class="flex-wrap text-xl font-bold">
                        {{ Candidate.name }}
                    </div>
                </template>
                <div
                    v-for="(Ballot, index) in Candidate.ballots"
                    :key="index"
                    class="flex break-all"
                >
                    <div>{{ index + 1 }}.&nbsp;</div>
                    <div>{{ Ballot.token }}</div>
                </div>
            </el-card>
        </el-space>
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
