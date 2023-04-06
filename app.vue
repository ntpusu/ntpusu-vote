<template>
    <NuxtLoadingIndicator />
    <ElContainer>
        <ElHeader>
            <ClientOnly>
                <template #fallback>
                    <div class="pt-4 text-center text-gray-400">
                        Loading menu......
                    </div>
                </template>
                <ElMenu
                    :default-active="$route.path"
                    :unique-opened="true"
                    mode="horizontal"
                    :ellipsis="false"
                    :active-index="activeIndex"
                    @select="handleSelect"
                >
                    <span class="m-auto pl-2 text-xl font-bold sm:text-2xl"
                        >投票系統</span
                    >
                    <div class="flex-grow" />
                    <ElMenuItem
                        class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                        index="/"
                        @click="useRouter().push('/')"
                        >首頁</ElMenuItem
                    >
                    <ElMenuItem
                        v-if="status === 'authenticated'"
                        class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                        index="/vote"
                        @click="useRouter().push('/vote')"
                        >投票清單</ElMenuItem
                    >
                    <ElMenuItem
                        v-if="admin"
                        class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                        index="/admin"
                        @click="useRouter().push('/admin')"
                        >管理</ElMenuItem
                    >
                    <ElMenuItem
                        v-if="status === 'unauthenticated'"
                        class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                        index="/login"
                        @click="signIn('google', { callbackUrl: '/vote' })"
                        >登入</ElMenuItem
                    >
                    <ElMenuItem
                        v-else-if="status === 'authenticated'"
                        class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                        index="/logout"
                        @click="signOut({ callbackUrl: '/' })"
                        >登出</ElMenuItem
                    >
                </ElMenu>
            </ClientOnly>
        </ElHeader>
        <ElMain>
            <NuxtPage />
        </ElMain>
        <!-- <el-footer></el-footer> -->
    </ElContainer>
    <ElBacktop />
</template>

<script lang="ts" setup>
import { Ref } from 'vue'

const route = useRoute()

useHead({
    title: '國立臺北大學三峽校區學生會投票網站',
    titleTemplate() {
        return `${route.meta.title} | 學生會投票網站`
    },
    meta: [
        {
            name: 'og:title',
            content: `${route.meta.title} | 國立臺北大學三峽校區學生會投票網站`,
        },
        {
            name: 'og:description',
            content: '國立臺北大學三峽校區學生會投票網站',
        },
        {
            name: 'og:image',
            content:
                'https://i0.wp.com/su.ntpu.org/wp-content/uploads/2022/09/297330040_5472635102757142_2117759161702702779_n.jpg?resize=1024%2C1024&amp;ssl=1',
        },
        {
            name: 'og:url',
            content: 'https://ntpu-vote-2023.vercel.app/',
        },
        {
            name: 'og:site_name',
            content: '學生會投票網站',
        },
        {
            name: 'og:type',
            content: 'website',
        },
        {
            name: 'description',
            content: '國立臺北大學三峽校區學生會投票網站',
        },
        {
            name: 'keywords',
            content: '學生會,投票,臺北大學,三峽校區',
        },
        {
            name: 'author',
            content: '國立臺北大學三峽校區學生會',
        },
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

const { status, signIn, signOut } = useSession() as unknown as {
    status: Ref<string>
    signIn: (provider: string, options?: any) => Promise<void>
    signOut: (options?: any) => Promise<void>
}

const activeIndex = () => curIndex.value

const handleSelect = (key: string) => {
    curIndex.value = key
}

onMounted(() => {
    curIndex.value = useRouter().currentRoute.value.path

    $fetch('/api/checkAdmin').then((res) => {
        admin.value = res
    })
})
</script>
