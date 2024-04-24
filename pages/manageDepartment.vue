<template>
  <div style="text-align: -webkit-center">
    <h1 class="my-5 text-center text-2xl font-bold">管理選舉區</h1>
    <div class="demo-collapse">
      <el-collapse
        v-model="activeNames"
        class="w-2/3 border-2 px-4 py-2 rounded-xl border-blue-300 max-w-md"
      >
        <el-collapse-item
          title="所有科系名稱及投票區"
          name="1"
        >
          <!-- 顯示目前系統內的資料筆數 -->
          <el-table
            :data="
              departmentDetail!.map((d) => {
                return {
                  name: d.name,
                  group: d.departmentInGroup
                    .map((g) => g.group.name)
                    .join(', '),
                };
              })
            "
            style="width: 100%"
          >
            <el-table-column
              prop="name"
              label="name"
              width="200"
            />
            <el-table-column
              prop="group"
              label="Group"
              width="200"
            />
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </div>

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
      v-if="electorCount == 0"
    >
      <!-- 上傳按鈕 -->
      <template #trigger>
        <el-button type="primary">選擇檔案</el-button>
      </template>

      <!-- 提交按鈕 -->
      <el-button
        class="ml-3"
        type="success"
        @click="submitUpload"
      >
        上傳至伺服器端
      </el-button>

      <!-- 上傳提示 -->
      <template #tip>
        <div class="el-upload__tip">僅能上傳 .xlsx 文件</div>
      </template>
    </el-upload>

    <br />
    <div class="demo-progress">
      <el-text
        v-if="uploadDialogVisible"
        class="mx-1"
        size="large"
        >上傳中...</el-text
      >
      <!-- 顯示上傳進度條 -->
      <el-progress
        v-if="uploadDialogVisible"
        class="mt-3 w-2/3"
        :percentage="100"
        status="success"
        :indeterminate="true"
        :duration="2"
      />
    </div>
    <!-- 刪除選區 -->
    <div class="demo-progress">
      <el-text
        v-if="deletingDialogVisible"
        class="mx-1"
        size="large"
        >刪除中...</el-text
      >
      <!-- 顯示刪除進度條 -->
      <el-progress
        v-if="deletingDialogVisible"
        class="mt-3 w-2/3"
        :percentage="100"
        status="exception"
        :indeterminate="true"
        :duration="1"
      />
    </div>
    <!-- 顯示目前系統內的資料筆數 -->
    <el-text
      v-if="!uploadDialogVisible && !deletingDialogVisible"
      class="mx-1"
      size="large"
      >目前系統內有{{ electorCount }}筆資料</el-text
    >
    <br />
    <!-- 刪除選區 -->
    <el-button
      type="danger"
      @click="deleteGroupData"
      v-if="electorCount != 0"
      >刪除所有選區</el-button
    >
    <br />
  </div>
</template>


<script setup lang="ts">
import { ref } from "vue";
import type { UploadInstance } from "element-plus";

const uploadDialogVisible = ref(false);
const deletingDialogVisible = ref(false);
const queryInput = ref("");
const groupIdStatus = ref(0); /* 0: no input, 1 : not found, 2 : found data */
const seletingUploadMode = ref("");

const activeNames = ref(["1"]);

definePageMeta({
  middleware: ["admin"], 
  title: "管理選舉區", 
});

const uploadRef = ref<UploadInstance>();

const submitUpload = () => {
  uploadRef.value!.submit();
};
const {
  data: electorCount,
  refresh: electorCountRefresh,
} = await useFetch("/api/getGroupCnt");

const { data: departmentDetail, refresh: electorDetailRefresh } =
  await useFetch("/api/getAlldepartmentCnt");

const uploadfunc = async (item) => {
  const file = item.file as File;
  const fileType = file.name.substring(file.name.lastIndexOf("."));
  if (fileType !== ".xlsx") {
    ElMessage.error("錯誤:僅能上傳.xlsx文件");
    uploadRef.value!.clearFiles();
    return false;
  }

  if (seletingUploadMode.value == "override") {
    await useFetch("/api/delAllGroup", {
      method: "DELETE",
    });
  }
  let formData = new FormData();
  uploadDialogVisible.value = true;
  formData.append("fileName", file.name);
  formData.append("file", file);

  const { error: uploadingFileStatus } = await useFetch("/api/uploadGroup", {
    method: "POST",
    body: formData,
  });
  //console.log(uploadingFileName)
  uploadDialogVisible.value = false;
  electorCountRefresh();
  electorDetailRefresh();
  uploadRef.value!.clearFiles();
};

const deleteGroupData = async () => {
  ElMessageBox.confirm("確定要刪除所有選區嗎？", "刪除選區", {
    confirmButtonText: "刪除",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(async () => {
      deletingDialogVisible.value = true;
      await $fetch("/api/delAllGroup", {
        method: "DELETE",
      })
        .catch(() => {
          ElMessage.error("刪除失敗");
        })
        .finally(() => {
          queryInput.value = "";
          groupIdStatus.value = 0;
          electorCountRefresh();
          electorDetailRefresh();
        });
      deletingDialogVisible.value = false;
      ElMessage({
        type: "success",
        message: "刪除成功",
      });
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消刪除",
      });
    });
};
</script>
