<template>
    <ElForm
        label-width="auto"
        label-suffix=":"
        hide-required-asterisk
        class="m-auto flex h-[40vh] w-full flex-col items-center justify-center"
    >
        <ElFormItem label="憑證" class="m-auto w-11/12 md:w-2/3 lg:w-1/2">
            <ElInput v-model="input" placeholder="請輸入憑證" clearable />
        </ElFormItem>
        <ElButton
            type="primary"
            class="w-1/5 !rounded-md md:w-1/6 lg:w-1/12"
            @click="search"
        >
            <span class="font-bold">查 詢</span>
        </ElButton>
        <ClientOnly>
            <ElDialog
                title="選票內容"
                center
                align-center
                v-model="show"
                width="30%"
                class="min-w-fit !rounded-lg px-5"
            >
                <div class="flex flex-col flex-wrap items-start justify-center">
                    <h1 class="text-lg font-bold">項目：{{ data.vote }}</h1>
                    <h1 class="text-lg font-bold">
                        選擇：{{ data.candidate }}
                    </h1>
                    <h1 class="text-lg font-bold">
                        時間：{{ new Date(data.time).toLocaleString() }}
                    </h1>
                </div>
            </ElDialog>
        </ClientOnly>
    </ElForm>
</template>

<script setup lang="ts">
definePageMeta({
    middleware: ['admin'],
    title: '查詢',
})

const input = ref('')

const show = ref(false)

const data: Ref<{
    vote: string
    candidate: string
    time: string
}> = ref({
    vote: '',
    candidate: '',
    time: '',
})

const search = async () => {
    if (input.value == '') {
        ElMessage({
            message: '請輸入憑證',
            type: 'warning',
        })
        return
    }

    data.value = (
        await useFetch('/api/getBallot', {
            method: 'POST',
            body: JSON.stringify({
                token: input.value,
            }),
        })
    ).data.value!

    show.value = true
}
</script>
