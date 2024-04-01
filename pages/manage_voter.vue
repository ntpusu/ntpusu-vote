<template>
    <div style="text-align: -webkit-center">
        <el-text class="mx-1" size="large">上傳投票者名單</el-text>
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
        <template #trigger>
            <el-button type="primary">選擇檔案</el-button>
        </template>
    
        <el-button class="ml-3" type="success" @click="uploadDialogVisible = true">
            上傳至伺服器端
        </el-button>
    
        <template #tip>
            <div class="el-upload__tip">
                僅能上傳 .xlsx 文件
            </div>
        </template>
        </el-upload>
        <el-text class="mx-1" size="large">目前系統內已有{{voterCount}}筆投票者資料</el-text>

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
        <el-button plain @click="dataChangedialogVisible = true">
            個別資料更動
        </el-button>

        <el-dialog
            v-model="dataChangedialogVisible"
            title="更動頁面"
            width="500"
        >
            <div style="text-align: -webkit-center">
            <el-input v-model="queryInput" style="width: 240px" size="large" placeholder="請輸入學號" />
            <el-button :icon="Search" size="large" @click="queryStudentData">查詢</el-button>
            <br><br>
            <template v-if="studentIdStatus == 1" :key= "studentIdStatus">
                <el-text class="mx-1" size="large" type="danger">
                    資料不存在
                </el-text>
                <br>
                <br>
                <el-text class="mx-1" size="large">
                    新增資料
                </el-text>
                <br>
                <el-text class="mx-1" size="large">
                    系別&nbsp :&nbsp
                </el-text>
                <el-input v-model="addNewDepartmentInput" style="width: 240px" size="small" placeholder="請輸入欲新增系別" />
                <br>
                <br>
                <el-button plain @click="addNewVoter">
                    新增
                </el-button>
            </template>
            <template v-if="studentIdStatus == 2" :key= "studentIdStatus">
                <el-text class="mx-1" size="large">
                    系別&nbsp : &nbsp{{voterData!.group}}  &nbsp&nbsp
                </el-text>
                <el-input v-model="modifydepartmentInput" style="width: 240px" size="small" placeholder="請輸入改動後系別" />
                <el-button size="small" @click="modifyDepartment">修改</el-button>
                <br>
                <br>
                <el-button type="danger" @click="deleteVoterData">刪除此投票者資料</el-button>
            </template>
            </div>
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

import { ref } from 'vue'
import type { UploadInstance, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'

const dataChangedialogVisible = ref(false)
const uploadDialogVisible = ref(false)
const queryInput = ref('')
const modifydepartmentInput = ref('')
const studentIdStatus = ref(0) /* 0: no input, 1 : not found, 2 : found data */
const seletingUploadMode = ref('')
const addNewStudentIdInput = ref('')
const addNewDepartmentInput = ref('')
let queryInputData = ''
const uploadModes = [
  {
    value: 'override',
    label: '覆蓋現有全部資料',
  },
  {
    value: 'add',
    label: '新增',
  },
]

const voterData: Ref<{
    id: number
    group: string
    first: {
        serNum: number | null
        time: string | null
    }
} | null> = ref(null)

definePageMeta({
    middleware: ['admin'],
    title: '管理投票者頁面',
})

const uploadRef = ref<UploadInstance>()

const submitUpload = () => {
    uploadRef.value!.submit()
}

const {
    data: voterCount,
    refresh: voterCountRefresh,
} = await useLazyFetch('/api/getVoterCnt')

const uploadfunc = async (item : any) => {
    const file = item.file as File
    const fileType = file.name.substring(file.name.lastIndexOf('.'))
    if (fileType !== '.xlsx') {
        ElMessage.error('錯誤:僅能上傳.xlsx文件')
        uploadRef.value!.clearFiles()
        return false
    }
    if (seletingUploadMode.value == 'override') {
        await useFetch('/api/delAllVoter', {
            method: 'DELETE',
        })
    }
    let formData = new FormData()

    formData.append("file", file)
    const {
        error: uploadingFileError,
    } = await useFetch('/api/uploadVoter', {
            method: 'POST',
            body: formData,
        })

    if (uploadingFileError.value) {
        ElMessage('上傳失敗')
    }
    else {
        ElMessage('上傳成功')
    }
    voterCountRefresh()
    uploadRef.value!.clearFiles()
}

const queryStudentData = async() => {
    const res = await useFetch('/api/getVoter', {
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

const deleteVoterData = async () => {
    await useFetch('/api/delVoter', {
        method: 'DELETE',
        query: { id: queryInputData },
    })
        .catch(() => {
            ElMessage.error('刪除失敗')
        })
        .finally(() => {
            queryInput.value = ''
            studentIdStatus.value = 0
            voterCountRefresh()
        })
}

const uploadSubmit = async () => {
    submitUpload();
    uploadDialogVisible.value = false;
}

const addNewVoter = async () => {
    const addNewStudentId = addNewStudentIdInput.value;
    const addNewDepartment = addNewDepartmentInput.value;
    if(addNewStudentId.length !== 9) {
        throw createError
    }
    await useFetch('api/addVoter', {
        method: 'PUT',
        query: { 
            id: parseInt(addNewStudentId),
            department: addNewDepartment,
        },
    }) 
}


</script>
