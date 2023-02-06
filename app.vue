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
                        <h1 class="m-auto pl-2 text-2xl font-bold">投票系統</h1>
                        <div class="flex-grow" />
                        <el-menu-item class="font-bold" index="/"
                            >首頁</el-menu-item
                        >
                        <el-menu-item
                            v-if="loginState"
                            class="font-bold"
                            index="/allVote"
                            >投票清單</el-menu-item
                        >
                        <el-menu-item
                            v-if="!loginState"
                            class="font-bold"
                            index="/login"
                            >登入</el-menu-item
                        >
                        <el-menu-item v-else class="font-bold" index="/logout"
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

const curIndex = ref('1')
const loginState = useState('loginState') as Ref<boolean>

const activeIndex = () => curIndex.value

const handleSelect = (key: string, keyPath: string[]) => {
    curIndex.value = key
}
</script>
