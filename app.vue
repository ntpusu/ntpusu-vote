<template>
    <NuxtLoadingIndicator />
    <div>
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
                        :router="true"
                        :ellipsis="false"
                        @select="handleSelect"
                    >
                        <span class="m-auto pl-2 text-xl font-bold sm:text-2xl"
                            >投票系統</span
                        >
                        <div class="flex-grow" />
                        <el-menu-item
                            class="!px-3 !text-[0.8rem] font-bold sm:!px-5 sm:!text-[1rem]"
                            index="/"
                            >首頁</el-menu-item
                        >
                        <el-menu-item
                            v-if="loginState"
                            class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                            index="/vote"
                            >投票清單</el-menu-item
                        >
                        <el-menu-item
                            v-if="loginState"
                            class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                            index="/admin"
                            >管理</el-menu-item
                        >
                        <el-menu-item
                            v-if="!loginState"
                            class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                            index="/login"
                            >登入</el-menu-item
                        >
                        <el-menu-item
                            v-else
                            class="ms:!px-5 !px-3 !text-[0.8rem] font-bold sm:!text-[1rem]"
                            index="/logout"
                            >登出</el-menu-item
                        >
                    </el-menu>
                </ClientOnly>
            </el-header>
            <el-main>
                <NuxtPage />
            </el-main>
            <!-- <el-footer></el-footer> -->
        </el-container>
    </div>
    <el-backtop />
</template>

<script lang="ts" setup>
import { Ref } from 'vue'

const curIndex = ref('/')
const loginState = useState('loginState') as Ref<boolean>

const activeIndex = () => curIndex.value

const handleSelect = (key: string, keyPath: string[]) => {
    curIndex.value = key
}
</script>
