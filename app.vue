<template>
    <ElContainer
        direction="vertical"
        class="h-[100vh]"
    >
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
                    @click="useRouter().push('/')"
                >
                    選舉委員會
                </span>
                <div class="flex-grow" />
                <ElMenuItem
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/"
                    @click="useRouter().push('/')"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        首頁
                    </span>
                </ElMenuItem>
                <ElMenuItem
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/bulletin"
                    @click="useRouter().push('/bulletin')"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        選舉資訊
                    </span>
                </ElMenuItem>
                <ElMenuItem
                    v-if="status === 'authenticated'"
                    class="!px-3 sm:!px-4 md:!px-5"
                    index="/vote"
                    @click="useRouter().push('/vote')"
                >
                    <span class="text-sm font-bold sm:text-base md:text-lg">
                        投票
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
                    @click="useRouter().push('/login')"
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
        <ElAffix
            v-if="showLoginBadge"
            class="absolute right-6 top-[4.5rem] z-10 hover:animate-pulse sm:right-8 sm:top-20 md:right-10 md:top-[5.5rem]"
        >
            <ClientOnly>
                <ElTooltip
                    effect="dark"
                    content="你的登入序號"
                    placement="left"
                >
                    <div
                        class="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-blue-500 sm:h-12 sm:w-12 md:h-14 md:w-14"
                        @click="showLoginInfo"
                    >
                        <span
                            class="text-sm font-bold text-white sm:text-base"
                            >{{ loginInfo.id }}</span
                        >
                    </div>
                </ElTooltip>
            </ClientOnly>
        </ElAffix>
        <ElAffix
            class="absolute right-6 z-10 sm:right-8 md:right-10"
            :class="
                showLoginBadge
                    ? 'top-[7.5rem] sm:top-[8.5rem] md:top-[9.5rem]'
                    : 'top-[4.5rem] sm:top-20 md:top-[5.5rem]'
            "
        >
            <ClientOnly>
                <ElTooltip
                    effect="dark"
                    content="累計已登入人數"
                    placement="left"
                >
                    <div
                        class="bg- flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-green-600 hover:animate-pulse sm:h-12 sm:w-12 md:h-14 md:w-14"
                        @click="showTodayBadge = true"
                    >
                        <span
                            class="text-sm font-bold text-white sm:text-base"
                            >{{ totalCnt }}</span
                        >
                    </div>
                </ElTooltip>
            </ClientOnly>
        </ElAffix>
        <ClientOnly>
            <ElDialog
                v-model="showTodayBadge"
                align-center
                lock-scroll
                :show-close="false"
                width="30%"
                @click="showTodayBadge = false"
                class="-py-4 min-w-fit !rounded-lg"
            >
                <div
                    class="-mt-7 flex flex-col items-center justify-center md:flex-row"
                >
                    <ElTooltip
                        effect="dark"
                        placement="top"
                    >
                        <template #content>
                            <div class="text-center">
                                投票開始前每日重置<br />投票開始後不再重置
                            </div>
                        </template>
                        <div class="m-3 text-center">
                            <div class="text-lg text-black">累計已登入人數</div>
                            <div class="text-2xl font-bold text-black">
                                {{ totalCnt }} 人
                            </div>
                        </div>
                    </ElTooltip>
                    <ElDivider
                        direction="vertical"
                        border-style="dashed"
                        class="!hidden !h-16 !border-l-2 md:!inline-block"
                    />
                    <ElDivider
                        border-style="dashed"
                        class="!m-0 !border-t-2 md:!hidden"
                    />
                    <ElTooltip
                        effect="dark"
                        placement="top"
                    >
                        <template #content>
                            <div class="text-center">
                                投票期間為<br />2023年5月24日<br />00:00 ~ 23:59
                            </div>
                        </template>
                        <div class="m-3 text-center">
                            <div class="text-lg text-black">
                                投票期間登入人數
                            </div>
                            <div class="text-2xl font-bold text-black">
                                {{ realCnt }} 人
                            </div>
                        </div>
                    </ElTooltip>
                </div>
            </ElDialog>
        </ClientOnly>
        <ElScrollbar :always="true">
            <noscript>
                您的瀏覽器尚未啟用
                JavaScript，因此無法開啟檔案。請於啟用後重新載入頁面。
            </noscript>
            <div class="m-2 sm:m-3 md:m-4">
                <NuxtPage keepalive />
            </div>
        </ElScrollbar>
        <ElDivider class="!m-0" />
        <div
            class="z-10 flex h-6 items-center justify-between bg-white px-2 sm:h-7 sm:px-3 md:h-8 md:px-4"
        >
            <span
                class="text-xs font-bold text-stone-700 sm:text-sm md:text-base"
            >
                Design by
                <NuxtLink
                    to="https://github.com/garyellow"
                    class="font-bold hover:text-stone-600 hover:underline"
                    target="_blank"
                    >garyellow</NuxtLink
                >
                |
                <NuxtLink
                    to="https://github.com/garyellow/ntpusu-vote-2023"
                    class="font-bold hover:text-stone-600 hover:underline"
                    target="_blank"
                    >Open Source</NuxtLink
                >
            </span>
            <span
                class="text-xs font-bold text-stone-700 sm:text-sm md:text-base"
            >
                ©
                {{ new Date().getFullYear() }}
                <NuxtLink
                    to="https://www.facebook.com/NTPUSU"
                    class="font-bold hover:text-stone-600 hover:underline"
                    target="_blank"
                    >國立臺北大學三峽校區學生會</NuxtLink
                >
            </span>
        </div>
        <ElCard
            v-if="!cookie"
            class="fixed bottom-0 z-20 w-full !rounded-b-none !rounded-t-3xl"
        >
            <template #header>
                <div class="-my-1 mx-2 flex justify-between sm:mx-4 md:mx-6">
                    <div
                        class="flex items-center text-base font-bold md:text-lg"
                    >
                        Cookie 使用聲明
                    </div>
                    <ElButton
                        type="warning"
                        @click="cookie = '1'"
                    >
                        <span class="font-bold">了 解</span>
                    </ElButton>
                </div>
            </template>
            <div class="flex justify-center">
                <span
                    class="w-11/12 whitespace-pre-wrap break-words text-xs sm:text-sm md:text-base"
                    >國立臺北大學三峽校區學生會投票網站（下稱「投票網站」）使用cookie來記錄您的登入狀態及增進您的使用體驗。這些Cookie僅限於投票網站使用，不會將Cookie用於商業目的。這些Cookie將在您使用投票網站時存儲在您的設備上，並在一定時間後過期。您可以在您的瀏覽器設置中管理和刪除cookie。如果您選擇禁用cookie，將會無法使用投票網站的登入功能。繼續使用投票網站即表示你同意我們使用Cookie。若您對此使用聲明有任何疑問，請隨時<NuxtLink
                        to="https://www.facebook.com/NTPUSU"
                        target="_blank"
                        class="whitespace-pre-wrap break-all font-bold text-blue-400 hover:text-blue-500 hover:underline"
                        >聯繫我們</NuxtLink
                    >。</span
                >
            </div>
        </ElCard>
    </ElContainer>
</template>

<script setup lang="ts">
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
    ogUrl: 'https://ntpusu-vote.vercel.app/',
    ogImage: 'https://ntpusu-vote.vercel.app/favicon.ico',
    ogImageAlt: '國立臺北大學三峽校區學生會的標誌',
    ogImageType: 'image/png',
    ogImageSecureUrl: 'https://ntpusu-vote.vercel.app/',
    ogLocale: 'zh_TW',
    ogLocaleAlternate: 'zh_TW',
    author: '國立臺北大學三峽校區學生會',
    creator: '國立臺北大學三峽校區學生會',
    publisher: '國立臺北大學三峽校區學生會',
    twitterTitle: '國立臺北大學三峽校區學生會投票網站',
    twitterDescription() {
        return `${route.meta.title} | 國立臺北大學三峽校區學生會投票網站`
    },
    twitterImage: 'https://ntpusu-vote.vercel.app/favicon.ico',
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
    script: [
        {
            src: 'https://www.instagram.com/embed.js',
            tagPosition: 'bodyClose',
        },
    ],
})

const curIndex = ref(useRoute().path)

const { data: admin } = await useFetch('/api/checkAdmin')

const { status, signOut } = useAuth()

const handleSelect = (key: string) => {
    curIndex.value = key
}

const cookie = useCookie('cookie', {
    sameSite: 'lax',
    secure: true,
})

const loginInfo = ref({
    id: 0,
    time: '',
})

const showLoginInfo = async () => {
    await ElMessageBox.alert(
        '之後會用此序號抽出得獎者',
        '你是第 ' + loginInfo.value.id + ' 個登入投票網站的人',
        {
            confirmButtonText: '確 定',
            showClose: false,
            lockScroll: true,
            autofocus: false,
            closeOnClickModal: true,
            closeOnPressEscape: true,
            type: 'success',
            roundButton: true,
        },
    ).catch(() => {})
}

const showLoginBadge = ref(false)
const showTodayBadge = ref(false)

const checkLogin = () => {
    setTimeout(async () => {
        if (status.value) {
            if (status.value === 'authenticated') {
                const {
                    data: res,
                    refresh,
                    error,
                } = await useFetch('/api/checkLogin')

                while (!res.value) {
                    if (error.value) {
                        ElMessage.error('操作過於頻繁，無法獲得登入序號')
                        return
                    }

                    setTimeout(async () => {
                        await refresh()
                    }, 250)
                }

                loginInfo.value = res.value.login
                showLoginBadge.value = true

                if (res.value.firstLogin) {
                    await showLoginInfo()
                }
            }
        } else checkLogin()
    }, 250)
}

const { data: totalCnt } = await useFetch('/api/getLoginCnt')

const { data: realCnt } = await useFetch('/api/getLoginCnt', {
    params: {
        startTime: new Date(2023, 4, 24).getTime(),
        endTime: new Date(2023, 4, 24, 23, 59, 59).getTime(),
    },
})

onMounted(() => {
    checkLogin()
})
</script>

<style>
.page-enter-active,
.page-leave-active {
    @apply transition-all duration-200;
}

.page-enter-from,
.page-leave-to {
    @apply opacity-0 blur;
}

.grecaptcha-badge {
    @apply z-20;
}
</style>
