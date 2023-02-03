<template>
  <NuxtLoadingIndicator />
  <div>
    <el-container>
      <el-header>
        <ClientOnly>
          <template #fallback>
            <div class="margin">
              Loading menu......
            </div>
          </template>
          <el-menu :default-active="$route.path" :unique-opened="true" mode="horizontal" :router="true"
            :ellipsis="false" @select="handleSelect">
            <h1 class="margin">投票系統</h1>
            <div class="flex-grow" />
            <el-menu-item index="/">首頁</el-menu-item>
            <el-menu-item v-if="check_login()" index="/login">登入</el-menu-item>
            <el-menu-item v-else index="/logout">登出</el-menu-item>
          </el-menu>
        </ClientOnly>
      </el-header>
      <el-main>
        <NuxtPage />
      </el-main>
      <!-- <el-footer>Footer</el-footer> -->
    </el-container>
  </div>
  <el-backtop />
</template>

<script>
export default {
  data() {
    return {
      curIndex: '1',
      un: useCookie('un'),
    }
  },
  methods: {
    activeIndex() {
      return this.curIndex
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath)
    },
    check_login() {
      if (this.un == undefined || this.un == '')
        return false
      else
        return true
    },
  },
}
</script>

<style>
.flex-grow {
  flex-grow: 1;
}
</style>