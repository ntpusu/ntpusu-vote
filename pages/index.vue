<template>
    <ElScrollbar height="85vh" class="-my-1.5">
        <div class="flex flex-col flex-wrap content-center">
            <ElSteps direction="vertical" align-center space="12vh">
                <ElStep
                    v-for="(activity, index) in activities"
                    :key="index"
                    :status="
                        activity.start.getTime() > Date.now()
                            ? 'wait'
                            : activity.finish.getTime() > Date.now()
                            ? 'finish'
                            : 'success'
                    "
                    class="tracking-[2px]"
                >
                    <template #title>
                        <div class="font-bold sm:text-lg">
                            {{ activity.content }}
                        </div>
                    </template>
                    <template #description>
                        <div class="min-w-max sm:text-base">
                            {{
                                activity.end
                                    ? activity.start.toLocaleString(undefined, {
                                          dateStyle: 'long',
                                      }) +
                                      '〜' +
                                      activity.end.toLocaleString(undefined, {
                                          dateStyle: 'long',
                                      })
                                    : activity.start.toLocaleString(undefined, {
                                          dateStyle: 'long',
                                      })
                            }}
                        </div>
                    </template>
                </ElStep>
            </ElSteps>
            <ElButton
                type="danger"
                class="mx-auto -mt-4 mb-5 w-[10%] min-w-fit sm:mb-10 sm:mt-4"
                auto-insert-space
                @click="useRouter().push('/vote/')"
            >
                <span class="font-bold">前 往 投 票 頁 面</span>
            </ElButton>
        </div>
    </ElScrollbar>
</template>

<script lang="ts" setup>
definePageMeta({
    auth: false,
    title: '首頁',
})

const activities = [
    {
        content: '登記參選',
        start: new Date(2023, 4, 1),
        end: new Date(2023, 4, 12),
        finish: new Date(2023, 4, 13),
    },
    {
        content: '候選人名單公告',
        start: new Date(2023, 4, 16),
        finish: new Date(2023, 4, 17),
    },
    {
        content: '選舉公報',
        start: new Date(2023, 4, 19),
        finish: new Date(2023, 4, 20),
    },
    {
        content: '線上投票',
        start: new Date(2023, 4, 26),
        finish: new Date(2023, 4, 27),
    },
    {
        content: '當選名單公告',
        start: new Date(2023, 4, 27),
        finish: new Date(2023, 4, 28),
    },
    {
        content: '(補選)登記參選',
        start: new Date(2023, 4, 29),
        end: new Date(2023, 5, 5),
        finish: new Date(2023, 5, 6),
    },
    {
        content: '(補選)候選人名單公告',
        start: new Date(2023, 5, 7),
        finish: new Date(2023, 5, 8),
    },
    {
        content: '(補選)選舉公報',
        start: new Date(2023, 5, 8),
        finish: new Date(2023, 5, 9),
    },
    {
        content: '(補選)線上投票',
        start: new Date(2023, 5, 15),
        finish: new Date(2023, 5, 16),
    },
    {
        content: '(補選)當選名單公告',
        start: new Date(2023, 5, 16),
        finish: new Date(2023, 5, 17),
    },
]
</script>
