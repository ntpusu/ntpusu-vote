<template>
  <div class="flex flex-col items-center">
    <h1 class="my-5 text-center text-2xl font-bold">管理選舉區</h1>
    <ElCollapse
      v-model="activeNames"
      class="w-5/6 max-w-max rounded-xl border-2 border-blue-300 px-4 py-2"
    >
      <ElCollapseItem
        title="所有科系名稱及投票區"
        name="1"
      >
        <!-- 顯示目前系統內的資料筆數 -->
        <ElTable
          :data="
            departmentDetail!.map((d) => {
              return {
                name: d.name,
                group: d.departmentInGroup.map((g) => g.group.name).join(', '),
              };
            })
          "
          class="w-full"
        >
          <ElTableColumn
            prop="name"
            label="name"
            width="200"
          />
          <ElTableColumn
            prop="group"
            label="Group"
            width="200"
          />
        </ElTable>
      </ElCollapseItem>
    </ElCollapse>
    <!-- 檔案上傳元件 -->
    <ElUpload
      v-if="electorCount == 0"
      ref="uploadRef"
      action="none"
      accept=".xlsx"
      :http-request="uploadFunc"
      :drag="true"
      :auto-upload="false"
      :limit="1"
    >
      <!-- 上傳按鈕 -->
      <template #trigger>
        <ElButton type="primary">選擇檔案</ElButton>
      </template>
      <!-- 提交按鈕 -->
      <ElButton
        class="ml-3"
        type="success"
        @click="submitUpload"
      >
        上傳至伺服器端
      </ElButton>
      <!-- 上傳提示 -->
      <template #tip>
        <div class="el-upload__tip">僅能上傳 .xlsx 文件</div>
      </template>
    </ElUpload>
    <br>
    <div class="demo-progress">
      <ElText
        v-if="uploadDialogVisible"
        class="mx-1"
        size="large"
        >上傳中...</ElText
      >
      <!-- 顯示上傳進度條 -->
      <ElProgress
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
      <ElText
        v-if="deletingDialogVisible"
        class="mx-1"
        size="large"
        >刪除中...</ElText
      >
      <!-- 顯示刪除進度條 -->
      <ElProgress
        v-if="deletingDialogVisible"
        class="mt-3 w-2/3"
        :percentage="100"
        status="exception"
        :indeterminate="true"
        :duration="1"
      />
    </div>
    <!-- 顯示目前系統內的資料筆數 -->
    <ElText
      v-if="!uploadDialogVisible && !deletingDialogVisible"
      class="mx-1"
      size="large"
      >目前系統內有{{ electorCount }}筆資料</ElText
    >
    <br>
    <!-- 刪除選區 -->
    <ElButton
      v-if="electorCount != 0"
      type="danger"
      @click="deleteGroupData"
      >刪除所有選區</ElButton
    >
    <br>
  </div>
</template>

<script setup lang="ts">
import type { UploadInstance } from "element-plus";
definePageMeta({
  middleware: ["admin"],
  title: "管理選舉區",
});

enum studentIdStatusEnum {
  noInput,
  notFound,
  Found,
}

const uploadDialogVisible = ref(false);
const deletingDialogVisible = ref(false);
const queryInput = ref("");
const departmentIdStatus = ref(studentIdStatusEnum.noInput);
const selectUploadMode = ref("");

const activeNames = ref(["1"]);

const uploadRef = ref<UploadInstance>();

const submitUpload = () => {
  uploadRef.value!.submit();
};
const { data: electorCount, refresh: electorCountRefresh } = await useFetch(
  "/api/department/getCnt",
);

const { data: departmentDetail, refresh: electorDetailRefresh } =
  await useFetch("/api/department/getAllWithGroupName");

const uploadFunc = async (item: { file: File }) => {
  const file = item.file as File;
  const fileType = file.name.substring(file.name.lastIndexOf("."));
  if (fileType !== ".xlsx") {
    ElMessage.error("錯誤:僅能上傳.xlsx文件");
    uploadRef.value!.clearFiles();
    return false;
  }

  if (selectUploadMode.value == "override") {
    await $fetch("/api/department/delAll", {
      method: "DELETE",
    });
  }
  const formData = new FormData();
  uploadDialogVisible.value = true;
  formData.append("fileName", file.name);
  formData.append("file", file);

  await $fetch("/api/department/upload", {
    method: "POST",
    body: formData,
  });

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
      await $fetch("/api/department/delAll", {
        method: "DELETE",
      })
        .then(() => {
          ElMessage.success("刪除成功");

          queryInput.value = "";
          departmentIdStatus.value = studentIdStatusEnum.noInput;
          electorCountRefresh();
          electorDetailRefresh();
        })
        .catch(() => {
          ElMessage.error("刪除失敗");
        });

      deletingDialogVisible.value = false;
    })
    .catch(() => {
      ElMessage({
        type: "info",
        message: "取消刪除",
      });
    });
};
</script>
