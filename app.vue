<template>
    <NuxtLoadingIndicator />
    <ElContainer direction="vertical">
        <ElAffix>
            <ElHeader>
                <ClientOnly>
                    <template #fallback>
                        <div class="pt-4 text-center text-gray-400">
                            Loading menu......
                        </div>
                    </template>
                    <ElMenu
                        :default-active="$route.path"
                        unique-opened
                        mode="horizontal"
                        :ellipsis="false"
                        :active-index="curIndex"
                        @select="handleSelect"
                        class="h-[8.5vh] sm:h-[9vh] md:h-[9.5vh]"
                    >
                        <span
                            class="m-auto cursor-pointer pl-2 text-xl font-bold sm:text-2xl"
                            @click="useRouter().push('/')"
                        >
                            選舉委員會
                        </span>
                        <div class="flex-grow" />
                        <ElMenuItem
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/"
                            @click="useRouter().push('/')"
                        >
                            首頁
                        </ElMenuItem>
                        <ElMenuItem
                            v-if="status === 'authenticated'"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/vote"
                            @click="useRouter().push('/vote')"
                        >
                            投票
                        </ElMenuItem>
                        <ElMenuItem
                            v-if="admin"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/check"
                            @click="useRouter().push('/check')"
                        >
                            查詢
                        </ElMenuItem>
                        <ElMenuItem
                            v-if="admin"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/admin"
                            @click="useRouter().push('/admin')"
                        >
                            管理
                        </ElMenuItem>
                        <ElMenuItem
                            v-if="status === 'unauthenticated'"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/login"
                            @click="useRouter().push('/login')"
                        >
                            登入
                        </ElMenuItem>
                        <ElMenuItem
                            v-else-if="status === 'authenticated'"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/logout"
                            @click="signOut({ callbackUrl: '/' })"
                        >
                            登出
                        </ElMenuItem>
                    </ElMenu>
                </ClientOnly>
            </ElHeader>
        </ElAffix>
        <ElMain>
            <ElScrollbar height="80vh" class="-my-2" :always="true">
                <NuxtPage />
                <noscript>
                    <strong>
                        此網頁需要支援 JavaScript
                        才能正確運行，請先至你的瀏覽器設定中開啟 JavaScript。
                    </strong>
                </noscript>
            </ElScrollbar>
        </ElMain>
        <ElAffix position="bottom" class="!h-6">
            <ElFooter class="!h-6">
                <ClientOnly>
                    <ElDrawer
                        v-model="showCookie"
                        direction="btt"
                        :show-close="false"
                        @close="cookie = 'true'"
                    >
                        <template #header="{ close }">
                            <div
                                class="mx-6 -mb-8 flex h-[5vh] justify-between sm:-mb-5 md:-mb-2"
                            >
                                <span class="text-sm sm:text-base md:text-lg">
                                    Cookie 使用聲明
                                </span>
                                <ElButton type="warning" @click="close">
                                    <span class="font-bold">了 解</span>
                                </ElButton>
                            </div>
                        </template>
                        <div class="-my-3 flex justify-center">
                            <span
                                class="w-11/12 whitespace-pre-wrap break-all text-xs sm:text-sm md:text-base"
                                >國立臺北大學三峽校區學生會投票網站(下稱「投票網站」)使用cookie來記錄您的登入狀態及增進您的使用體驗。這些cookie僅限於投票網站使用，不會與第三方共享cookie數據，也不會將cookie用於廣告目的。這些cookie將在您訪問投票網站時存儲在您的設備上，並在一定時間後過期。您可以在您的瀏覽器設置中管理和刪除cookie。如果您選擇禁用cookie，將會無法使用投票網站的登入功能。若您對此使用聲明有任何疑問，請隨時<NuxtLink
                                    to="https://www.facebook.com/NTPUSU"
                                    target="_blank"
                                    class="whitespace-pre-wrap break-all font-bold text-blue-400 hover:text-blue-700 hover:underline"
                                    >聯繫我們</NuxtLink
                                >
                                。</span
                            >
                        </div>
                    </ElDrawer>
                </ClientOnly>
                <ElDivider class="!m-0" />
                <div class="flex justify-center">
                    <span class="m-1 text-xs font-bold sm:text-sm md:text-base">
                        ©
                        {{ new Date().getFullYear() }}
                        <NuxtLink
                            to="https://www.facebook.com/NTPUSU"
                            class="whitespace-pre-wrap break-all font-bold hover:text-stone-600 hover:underline"
                            >國立臺北大學三峽校區學生會</NuxtLink
                        >
                        |
                        <NuxtLink
                            to="https://github.com/garyellow/ntpusu-vote-2023"
                            class="whitespace-pre-wrap break-all font-bold hover:text-stone-600 hover:underline"
                            >開放原始碼</NuxtLink
                        >
                    </span>
                </div>
            </ElFooter>
        </ElAffix>
    </ElContainer>
    <ElBacktop />
</template>

<script lang="ts" setup>
const route = useRoute()

useSeoMeta({
    title: '學生會投票網站',
    titleTemplate() {
        return `${route.meta.title} | 學生會投票網站`
    },
    description: '國立臺北大學三峽校區學生會投票網站',
    ogTitle: '國立臺北大學三峽校區學生會投票網站',
    ogDescription() {
        return `${route.meta.title} | 國立臺北大學三峽校區學生會投票網站`
    },
    ogSiteName: '國立臺北大學三峽校區學生會投票網站',
    ogType: 'website',
    ogUrl: 'https://ntpu-vote-2023.vercel.app/',
    ogImage: 'https://ntpu-vote-2023.vercel.app/favicon.ico',
    ogImageAlt:
        'https://i0.wp.com/su.ntpu.org/wp-content/uploads/2022/09/297330040_5472635102757142_2117759161702702779_n.jpg',
    ogImageUrl: 'https://ntpu-vote-2023.vercel.app/favicon.ico',
    ogImageType: 'image/png',
    ogLocale: 'zh_TW',
    author: '國立臺北大學三峽校區學生會',
    creator: '國立臺北大學三峽校區學生會',
    publisher: '國立臺北大學三峽校區學生會',
    twitterTitle: '國立臺北大學三峽校區學生會投票網站',
    twitterDescription() {
        return `${route.meta.title} | 國立臺北大學三峽校區學生會投票網站`
    },
    twitterImage: 'https://ntpu-vote-2023.vercel.app/favicon.ico',
    twitterImageAlt:
        'https://i0.wp.com/su.ntpu.org/wp-content/uploads/2022/09/297330040_5472635102757142_2117759161702702779_n.jpg',
})

useHead({
    htmlAttrs: {
        lang: 'zh_TW',
    },
    meta: [
        {
            name: 'copyright',
            content: '國立臺北大學三峽校區學生會',
        },
    ],
    link: [
        {
            rel: 'favicon icon',
            type: 'image/x-icon',
            href: '/favicon.ico',
        },
    ],
})

const curIndex = ref(useRoute().path)

const cookie = useCookie('cookie', {
    sameSite: 'lax',
    secure: true,
})

const showCookie = ref(!cookie.value)

const { data: admin } = useFetch('/api/checkAdmin')

const { status, signOut } = useAuth()

const handleSelect = (key: string) => {
    curIndex.value = key
}
</script>
