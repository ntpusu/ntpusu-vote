<template>
    <NuxtLoadingIndicator />
    <ElContainer>
        <ElHeader>
            <ClientOnly>
                <template #fallback>
                    <div class="pt-4 text-center">Loading menu......</div>
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
