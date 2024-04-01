<template>
    <div style="text-align: -webkit-center">
        <!-- 標題文字 -->
        <el-text class="mx-1" size="large">編輯選舉區</el-text>
        <!-- 檔案上傳元件 -->
        <el-upload
        ref="uploadRef"
        class="upload-demo"
        action="https://run.mocky.io/v3/9d059bf9-4660-45f2-925d-ce80ad6c4d15"
        accept=".xlsx"
        :drag="true"
        :auto-upload="false"
        >
        <!-- 上傳按鈕 -->
        <template #trigger>
            <el-button type="primary">選擇檔案</el-button>
        </template>
    
        <!-- 提交按鈕 -->
        <el-button class="ml-3" type="success" @click="submitUpload">
            上傳至伺服器端
        </el-button>
    
        <!-- 上傳提示 -->
        <template #tip>
            <div class="el-upload__tip">
            僅能上傳 .xlsx 文件
            </div>
        </template>
        </el-upload>
        <!-- 顯示目前系統內的資料筆數 -->
        <el-text class="mx-1" size="large">目前系統內有{{electorCount}}筆資料</el-text>
    </div>
</template>

<script setup lang="ts">
// 引入 vue 和 element-plus 的 UploadInstance
import { ref } from 'vue'
import type { UploadInstance } from 'element-plus'

// 定義頁面元資訊
definePageMeta({
    middleware: ['admin'], // 中介軟體
    title: '管理選舉區', // 標題
})

// 建立上傳元件的 ref
const uploadRef = ref<UploadInstance>()

// 定義提交上傳的方法
const submitUpload = () => {
  uploadRef.value!.submit()
}

// 使用 useLazyFetch 獲取選區數量
const {
    data: electorCount,
    //pending: adminPending,
    //refresh: adminRefresh,
} = await useLazyFetch('/api/getAllElector')

//const t = await useLazyFetch('/api/getAllVoter')

</script>
