<template>
    <NuxtLoadingIndicator />
    <ElContainer>
        <ElHeader>
            <ElAffix>
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
                            index="/vote/"
                            @click="useRouter().push('/vote/')"
                        >
                            投票
                        </ElMenuItem>
                        <ElMenuItem
                            v-if="admin"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/check/"
                            @click="useRouter().push('/check/')"
                        >
                            查詢
                        </ElMenuItem>
                        <ElMenuItem
                            v-if="admin"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/admin/"
                            @click="useRouter().push('/admin/')"
                        >
                            管理
                        </ElMenuItem>
                        <ElMenuItem
                            v-if="status === 'unauthenticated'"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/login/"
                            @click="useRouter().push('/login/')"
                        >
                            登入
                        </ElMenuItem>
                        <ElMenuItem
                            v-else-if="status === 'authenticated'"
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/logout/"
                            @click="signOut({ callbackUrl: '/' })"
                        >
                            登出
                        </ElMenuItem>
                    </ElMenu>
                </ClientOnly>
            </ElAffix>
        </ElHeader>
        <ElMain>
            <NuxtPage />
        </ElMain>
        <ElFooter v-if="showCookie">
            <ClientOnly>
                <ElDrawer
                    v-model="showCookie"
                    direction="btt"
                    size="25%"
                    @close="cookie = 'true'"
                >
                    <template #header>
                        <span class="-my-3 text-sm sm:text-base md:text-lg">
                            Cookie 使用聲明
                        </span>
                    </template>
                    <div class="-my-5 flex justify-center">
                        <span
                            class="w-11/12 whitespace-pre-wrap break-all text-xs sm:text-sm md:text-base"
                        >
                            我們使用cookie來記錄您的登入狀態，用以提升網站的安全性和增進使用者的使用體驗。我們不會與第三方共享cookie數據，也不會將cookie用於廣告目的。您可以在您的瀏覽器設置中管理和刪除cookie。若想了解更多關於我們的隱私政策，請查看我們的隱私政策頁面。
                        </span>
                    </div>
                </ElDrawer>
            </ClientOnly>
        </ElFooter>
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

const cookie = useCookie('cookie')
const showCookie = ref(!cookie.value)

const { data: admin } = useFetch('/api/checkAdmin')

const { status, signOut } = useAuth()

const handleSelect = (key: string) => {
    curIndex.value = key
}
</script>
