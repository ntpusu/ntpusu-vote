<template>
    <div class="flex h-[80vh]">
        <ClientOnly>
            <ElCard class="m-auto w-full sm:w-5/6 md:w-3/4 lg:w-1/2 xl:w-1/3">
                <template #header>
                    <ElPageHeader
                        @back="useRouter().back()"
                        title="回上頁"
                        content="登入"
                        class="font-bold"
                    />
                </template>
                <div class="flex w-full flex-col">
                    <NuxtImg
                        src="/login/btn_google_normal.png"
                        preload
                        class="m-auto my-2 max-w-[245px] cursor-pointer"
                        @click="signIn('google', { callbackUrl: '/vote' })"
                    />
                    <NuxtImg
                        src="/login/ms-symbollockup.svg"
                        preload
                        class="m-auto my-2 max-w-[240px] cursor-pointer"
                        @click="signIn('azure-ad', { callbackUrl: '/vote' })"
                    />
                    <span class="m-auto pt-5 text-sm text-gray-500">
                        請使用學校 Google 或 Microsoft 帳號進行登錄
                    </span>
                    <span class="m-auto text-sm text-gray-500">
                        (s+學號@gm.ntpu.edu.tw 或 s+學號@ms.ntpu.edu.tw)
                    </span>
                </div>
            </ElCard>
        </ClientOnly>
    </div>
</template>

<script lang="ts" setup>
definePageMeta({
    auth: {
        unauthenticatedOnly: true,
        navigateAuthenticatedTo: '/',
    },
    title: '登入',
})

const { signIn } = useAuth()
</script>
