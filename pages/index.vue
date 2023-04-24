<template>
    <ElScrollbar height="85vh" class="-my-2">
        <div class="flex flex-col flex-wrap content-center">
            <ElSteps direction="vertical" align-center space="12vh" class="m-5">
                <ElStep
                    v-for="(activity, index) in activities"
                    :key="index"
                    :status="
                        activity.start.getTime() > Date.now()
                            ? 'process'
                            : activity.finish.getTime() > Date.now()
                            ? 'finish'
                            : 'success'
                    "
                    class="tracking-[1.5px]"
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
                            {{ activity.maybe ? '(預定)' : '' }}
                        </div>
                    </template>
                </ElStep>
            </ElSteps>
            <ElButton
                type="danger"
                class="mx-auto -mt-8 mb-5 w-[10%] min-w-fit sm:-mt-2 sm:mb-10"
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
        maybe: false,
    },
    {
        content: '候選人名單公告',
        start: new Date(2023, 4, 15),
        finish: new Date(2023, 4, 16),
        maybe: false,
    },
    {
        content: '選舉公報',
        start: new Date(2023, 4, 17),
        finish: new Date(2023, 4, 18),
        maybe: false,
    },
    {
        content: '候選人政見發表會',
        start: new Date(2023, 4, 22),
        finish: new Date(2023, 4, 23),
        maybe: true,
    },
    {
        content: '線上投票',
        start: new Date(2023, 4, 24),
        finish: new Date(2023, 4, 25),
        maybe: false,
    },
    {
        content: '當選名單公告',
        start: new Date(2023, 4, 25),
        finish: new Date(2023, 4, 26),
        maybe: false,
    },
    {
        content: '(補選)登記參選',
        start: new Date(2023, 4, 29),
        end: new Date(2023, 5, 5),
        finish: new Date(2023, 5, 6),
        maybe: false,
    },
    {
        content: '(補選)候選人名單公告',
        start: new Date(2023, 5, 7),
        finish: new Date(2023, 5, 8),
        maybe: false,
    },
    {
        content: '(補選)選舉公報',
        start: new Date(2023, 5, 8),
        finish: new Date(2023, 5, 9),
        maybe: false,
    },
    {
        content: '(補選)線上投票',
        start: new Date(2023, 5, 15),
        finish: new Date(2023, 5, 16),
        maybe: false,
    },
    {
        content: '(補選)當選名單公告',
        start: new Date(2023, 5, 16),
        finish: new Date(2023, 5, 17),
        maybe: false,
    },
]
</script>
