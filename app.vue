<template>
  <NuxtLoadingIndicator />
  <div class="common-layout">
    <el-container>
      <el-header>
        <ClientOnly fallback-tag="span" fallback="Loading comments...">
          <el-menu :default-active="activeIndex" class="el-menu-demo" mode="horizontal" @select="handleSelect">
            <el-menu-item index="1">Processing Center</el-menu-item>
            <el-sub-menu index="2">
              <template #title>Workspace</template>
              <el-menu-item index="2-1">item one</el-menu-item>
              <el-menu-item index="2-2">item two</el-menu-item>
              <el-menu-item index="2-3">item three</el-menu-item>
              <el-sub-menu index="2-4">
                <template #title>item four</template>
                <el-menu-item index="2-4-1">item one</el-menu-item>
                <el-menu-item index="2-4-2">item two</el-menu-item>
                <el-menu-item index="2-4-3">item three</el-menu-item>
              </el-sub-menu>
            </el-sub-menu>
            <el-menu-item index="3" disabled>Info</el-menu-item>
            <el-menu-item index="4">Orders</el-menu-item>
          </el-menu>
        </ClientOnly>
      </el-header>
      <el-main>
        <NuxtPage />
      </el-main>
      <el-footer>Footer</el-footer>
    </el-container>
  </div>
  <el-backtop />
</template>

<script>
export default {
  data() {
    return {
      activeIndex: '1',
    }
  },
  methods: {
    activeIndex() {
      return this.activeIndex
    },
    handleSelect(key, keyPath) {
      console.log(key, keyPath)
    },
  },
}
</script>