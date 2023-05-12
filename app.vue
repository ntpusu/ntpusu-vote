<template>
    <ElContainer direction="vertical" class="h-[100vh]">
        <NuxtLoadingIndicator />
        <ClientOnly>
            <template #fallback>
                <div
                    class="flex h-12 items-center justify-center sm:h-14 md:h-16"
                >
                    <span class="margin text-gray-400">
                        Loading menu......
                    </span>
                </div>
                <ElDivider class="!m-0" />
            </template>
            <ElMenu
                :default-active="useRoute().path"
                unique-opened
                mode="horizontal"
                :ellipsis="false"
                :active-index="curIndex"
                @select="handleSelect"
                class="h-14 sm:h-[3.75rem] md:h-16"
            >
                <span
                    class="m-auto ml-3 cursor-pointer text-xl font-bold sm:ml-4 sm:text-2xl md:ml-5 md:text-3xl"
                    @click="router('/')"
                >
                    選舉委員會
                </span>
                <div class="flex-grow" />
                <ElMenuItem
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/"
                    @click="router('/')"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        首頁
                    </span>
                </ElMenuItem>
                <ElMenuItem
                    v-if="status === 'authenticated'"
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/vote"
                    @click="router('/vote')"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        投票
                    </span>
                </ElMenuItem>
                <ElMenuItem
                    v-if="status === 'authenticated'"
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/form"
                    @click="router('/form')"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        表單
                    </span>
                </ElMenuItem>
                <ElMenuItem
                    v-if="admin"
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/check"
                    @click="useRouter().push('/check')"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        查詢
                    </span>
                </ElMenuItem>
                <ElMenuItem
                    v-if="admin"
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/admin"
                    @click="useRouter().push('/admin')"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        管理
                    </span>
                </ElMenuItem>
                <ElMenuItem
                    v-if="status === 'unauthenticated'"
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/login"
                    @click="tologin"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        登入
                    </span>
                </ElMenuItem>
                <ElMenuItem
                    v-else-if="status === 'authenticated'"
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/logout"
                    @click="signOut({ callbackUrl: '/' })"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        登出
                    </span>
                </ElMenuItem>
            </ElMenu>
        </ClientOnly>
        <ElScrollbar :always="true">
            <noscript>
                <strong>
                    您的瀏覽器尚未啟用
                    JavaScript，因此無法開啟檔案。請於啟用後重新載入頁面。
                </strong>
            </noscript>
            <div class="m-2 sm:m-3 md:m-4">
                <NuxtPage />
            </div>
        </ElScrollbar>
        <ElDivider class="!m-0" />
        <div
            class="flex h-6 items-center justify-center bg-white sm:h-7 md:h-8"
        >
            <span class="text-xs font-bold sm:text-sm md:text-base">
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
                        <div
                            class="flex items-center text-sm sm:text-base md:text-lg"
                        >
                            Cookie 使用聲明
                        </div>
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
                            class="whitespace-pre-wrap break-all font-bold text-blue-400 hover:text-blue-500 hover:underline"
                            >聯繫我們</NuxtLink
                        >
                        。</span
                    >
                </div>
            </ElDrawer>
        </ClientOnly>
    </ElContainer>
</template>

<script lang="ts" setup>
import { useReCaptcha } from 'vue-recaptcha-v3'

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
    ogImageAlt: '國立臺北大學三峽校區學生會的標誌',
    ogImageType: 'image/png',
    ogImageSecureUrl: 'https://ntpu-vote-2023.vercel.app/',
    ogLocale: 'zh_TW',
    ogLocaleAlternate: 'zh_TW',
    author: '國立臺北大學三峽校區學生會',
    creator: '國立臺北大學三峽校區學生會',
    publisher: '國立臺北大學三峽校區學生會',
    twitterTitle: '國立臺北大學三峽校區學生會投票網站',
    twitterDescription() {
        return `${route.meta.title} | 國立臺北大學三峽校區學生會投票網站`
    },
    twitterImage: 'https://ntpu-vote-2023.vercel.app/favicon.ico',
    twitterImageAlt: '國立臺北大學三峽校區學生會的標誌',
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

const { data: admin } = await useFetch('/api/checkAdmin')

const { status, signOut } = useAuth()

const handleSelect = (key: string) => {
    curIndex.value = key
}

const recaptchaInstance = useReCaptcha()

const recaptcha = async (action: string) => {
    await recaptchaInstance?.recaptchaLoaded()
    const token = await recaptchaInstance?.executeRecaptcha(action)

    return token
}

const router = async (to: string) => {
    const response = await recaptcha('router')

    const { data } = (await useFetch('/api/recaptcha', {
        method: 'POST',
        body: JSON.stringify({ response }),
    })) as unknown as {
        data: {
            value: {
                action: string
                challenge_ts: string
                hostname: string
                score: number
                success: boolean
            }
        }
    }

    if (data.value.action == 'router' && data.value.score > 0.6) {
        await useRouter().push(to)
    } else {
        ElMessage.error('ReCatCha驗證失敗，請稍後再試')
    }
}

const tologin = async () => {
    const response = await recaptcha('login')

    const { data } = (await useFetch('/api/recaptcha', {
        method: 'POST',
        body: JSON.stringify({ response }),
    })) as unknown as {
        data: {
            value: {
                action: string
                challenge_ts: string
                hostname: string
                score: number
                success: boolean
            }
        }
    }

    if (data.value.action == 'login' && data.value.score > 0.6) {
        await useRouter().push('/login')
    } else {
        ElMessage.error('ReCatCha驗證失敗，請稍後再試')
    }
}
</script>
