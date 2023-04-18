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
                        :active-index="activeIndex"
                        @select="handleSelect"
                    >
                        <span
                            class="m-auto cursor-pointer pl-2 text-xl font-bold sm:text-2xl"
                            @click="useRouter().push('/')"
                        >
                            投票系統
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
                            @click="signIn(undefined, { callbackUrl: '/vote' })"
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
            </ElAffix>
        </ElHeader>
        <ElMain>
            <NuxtPage />
        </ElMain>
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

const curIndex = ref('/')
const admin = ref(false)

const { status, signIn, signOut } = useAuth()

const activeIndex = () => curIndex.value

const handleSelect = (key: string) => {
    curIndex.value = key
}

onMounted(() => {
    curIndex.value = useRoute().path

    $fetch('/api/checkAdmin').then((res) => {
        admin.value = res
    })
})
</script>
