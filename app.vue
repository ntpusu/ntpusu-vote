<template>
    <NuxtLoadingIndicator />
    <el-container>
        <el-header>
            <ClientOnly>
                <template #fallback>
                    <div class="pt-4 text-center">Loading menu......</div>
                </template>
                <el-menu
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
                    <el-menu-item
                        class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                        index="/"
                        @click="useRouter().push('/')"
                        >首頁</el-menu-item
                    >
                    <el-menu-item
                        v-if="status === 'authenticated'"
                        class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                        index="/vote"
                        @click="useRouter().push('/vote')"
                        >投票清單</el-menu-item
                    >
                    <el-menu-item
                        v-if="admin"
                        class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                        index="/admin"
                        @click="useRouter().push('/admin')"
                        >管理</el-menu-item
                    >
                    <el-menu-item
                        v-if="status === 'unauthenticated'"
                        class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                        index="/login"
                        @click="signIn('google', { callbackUrl: '/vote' })"
                        >登入</el-menu-item
                    >
                    <el-menu-item
                        v-else-if="status === 'authenticated'"
                        class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                        index="/logout"
                        @click="signOut({ callbackUrl: '/' })"
                        >登出</el-menu-item
                    >
                </el-menu>
            </ClientOnly>
        </el-header>
        <el-main>
            <NuxtPage />
        </el-main>
        <el-footer>
            {{ status }}
            {{ data }}
        </el-footer>
    </el-container>
    <el-backtop />
</template>

<script lang="ts" setup>
import { ISODateString } from 'next-auth/core/types'
import { Ref } from 'vue'
interface DefaultSession {
    user?: {
        name?: string | null
        email?: string | null
        image?: string | null
    }
    expires: ISODateString
}

const curIndex = ref('/')
const admin = ref(false)

const { status, data, signIn, signOut } = useSession() as unknown as {
    status: Ref<string>
    data: Ref<DefaultSession> | null
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
