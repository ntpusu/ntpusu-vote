<template>
    <el-space class="container" wrap>
        <el-card v-for="i in VSCnt" :key="i" style="width: 250px">
            <template #header>
                <div>
                    <span v-if="VS != null">{{ VS[i].name }}</span>
                    <el-button class="button" text>Operation button</el-button>
                </div>
            </template>
            <div v-for="o in 4" :key="o">
                {{ 'List item ' + o }}
            </div>
        </el-card>
    </el-space>
    {{ VS }}
    {{ VSPending }}
    {{ VSCnt }}
    {{ VSCntPending }}
</template>

<script lang="ts" setup>
definePageMeta({
    middleware: ['auth'],
})

const { data: VS, pending: VSPending, refresh: VSRefresh } = useFetch('/api/voteSession')
const { data: VSCnt, pending: VSCntPending, refresh: VSCntRefresh } = useFetch('/api/voteSessionCnt')

</script>

<style>
.container {
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>