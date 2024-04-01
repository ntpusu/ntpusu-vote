<template>
    <div style="text-align: -webkit-center">
        <!-- 標題文字 -->
        <el-text class="mx-1" size="large">編輯選舉區</el-text>
        <!-- 檔案上傳元件 -->
        <el-upload
        ref="uploadRef"
        class="upload-demo"
        action="none"
        accept=".xlsx"
        :http-request="uploadfunc"
        :drag="true"
        :auto-upload="false"
        :limit="1"
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
    <el-dialog
            v-model="uploadDialogVisible"
            title="設定上傳模式"
            width="500"
            align-center
        >
        <el-select
            v-model="seletingUploadMode"
            placeholder="新增"
            size="large"
            style="width: 240px"
        >
            <el-option
                v-for="item in uploadModes"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            />
        </el-select>
        <br>
            <div class="dialog-footer">
                <el-button @click="uploadDialogVisible = false">取消</el-button>
                <el-button type="primary" @click="uploadSubmit">
                    確認上傳
                </el-button>
            </div>
        </el-dialog>
        <br>
        <br>

        <el-dialog
            v-model="dataChangedialogVisible"
            title="更動頁面"
            width="500"
        >
            <template #footer>
            <div class="dialog-footer">
                <el-button type="primary" @click="dialogVisible = false">
                    關閉頁面
                </el-button>
            </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
// 引入 vue 和 element-plus 的 UploadInstance
import { ref } from 'vue'
import type { UploadInstance } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const dataChangedialogVisible = ref(false)
const uploadDialogVisible = ref(false)
const queryInput = ref('')
const modifydepartmentInput = ref('')
const studentIdStatus = ref(0) /* 0: no input, 1 : not found, 2 : found data */
const seletingUploadMode = ref('')
let queryInputData = ''

const GroupData: Ref<{
    id: number
    Int: number
    first: {
        serNum: number | null
        time: number | null
    }
} | null> = ref(null)

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
    refresh: electorCountRefresh,
} = await useLazyFetch('/api/getAllElectorCnt')
//1. add api_getAllElectorCnt

//const t = await useLazyFetch('/api/getAllVoter')

const uploadfunc = async (item) => {
    const file = item.file as File
    const fileType = file.name.substring(file.name.lastIndexOf('.'))
    if (fileType !== '.xlsx') {
        ElMessage.error('錯誤:僅能上傳.xlsx文件')
        uploadRef.value!.clearFiles()
        return false
    }
    //2. add api_deleteAllgroup  ok
    if (seletingUploadMode.value == 'override') {
        await useFetch('/api/delAllGroup', {
            method: 'DELETE',
        })
    }
    let formData = new FormData()

    formData.append("fileName", file.name)
    formData.append("file", file)

    //3. add api_upload  ok
    const {
        data: uploadingFileStatus,
    } = await useFetch('/api/uploadGroup', {
            method: 'POST',
            body: formData,
        })
    //console.log(uploadingFileName)
    ElMessage.success('上傳成功' + " " + uploadingFileStatus)
    electorCountRefresh()
    uploadRef.value!.clearFiles()
}
//4. set api_getGroup
const queryStudentData = async() => {
    const res = await useFetch('/api/getGroup', {
        method: 'GET',
        query: { voter: parseInt(queryInput.value)},
    })
    if (res.error.value) {
        studentIdStatus.value = 1;
        return;
    }
    voterData.value = res.data.value
    queryInputData = queryInput.value
    studentIdStatus.value = 2;
}

const midifyDepartment = async () => {

}
//5. add api_delgroup
const deleteVoterData = async () => {
    await useFetch('/api/delgroup', {
        method: 'DELETE',
        query: { id: queryInputData },
    })
        .catch(() => {
            ElMessage.error('刪除失敗')
        })
        .finally(() => {
            queryInput.value = ''
            studentIdStatus.value = 0
            electorCountRefresh()
        })
}

const uploadSubmit = async () => {
    submitUpload();
    uploadDialogVisible.value = false;
}
//

</script>
