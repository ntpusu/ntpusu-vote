<template>
  <div style="text-align: -webkit-center">
    <ElText
      class="mx-1"
      size="large"
      >上傳投票者名單</ElText
    >
    <div class="mx-30">
      <ElUpload
        ref="uploadRef"
        action="none"
        accept=".xlsx"
        :http-request="uploadFunc"
        :drag="true"
        :auto-upload="false"
        :limit="1"
      >
        <template #trigger>
          <ElButton type="primary">選擇檔案</ElButton>
        </template>

        <ElButton
          class="ml-3"
          type="success"
          @click="uploadSubmit"
        >
          上傳至伺服器端
        </ElButton>

        <template #tip>
          <div class="el-upload__tip">僅能上傳 .xlsx 文件</div>
        </template>
      </ElUpload>
    </div>
    <ElText
      class="mx-1"
      size="large"
      >目前系統內已有{{ voterCount }}筆投票者資料</ElText
    >
    <br>
    <br>
    <ElButton
      type="danger"
      round
      @click="deleteAllVoterDialogVisible = true"
    >
      刪除所有投票者資料
    </ElButton>
    <ElDialog
      v-model="deleteAllVoterDialogVisible"
      :z-index="1000"
      title="確認要刪除所有投票者嗎?"
      width="500"
    >
      <span>刪除後將無法復原</span>
      <template #footer>
        <div class="dialog-footer">
          <ElButton @click="deleteAllVoterDialogVisible = false">取消</ElButton>
          <ElButton
            type="danger"
            @click="deleteAllVoter"
          >
            確認刪除
          </ElButton>
        </div>
      </template>
    </ElDialog>
    <br>
    <br>
    <ElButton
      plain
      @click="dataChangeDialogVisible = true"
    >
      個別資料更動
    </ElButton>

    <ElDialog
      v-model="dataChangeDialogVisible"
      :z-index="1000"
      title="更動頁面"
      width="500"
    >
      <div style="text-align: -webkit-center">
        <ElInput
          v-model="queryInput"
          style="width: 240px"
          size="large"
          placeholder="請輸入學號"
        />
        <ElButton
          :icon="Search"
          size="large"
          @click="queryStudentData"
          >查詢</ElButton
        >
        <br><br>
        <template v-if="queryInputData !== ''">
          <ElText
            class="mx-1"
            type="info"
            >當前為學號{{ queryInputData }}的資料</ElText
          >
        </template>
        <br><br>
        <template v-if="studentIdStatus == studentIdStatusEnum.notFound">
          <ElText
            class="mx-1"
            size="large"
            type="danger"
          >
            資料不存在
          </ElText>
          <br>
          <br>
          <ElText
            class="mx-1"
            size="large"
          >
            新增資料
          </ElText>
          <br>
          <ElAutocomplete
            v-model="departmentInput"
            :fetch-suggestions="queryAllDepartment"
            class="inline-input w-50"
            :placeholder="`學號${queryInputData}的系別`"
            value-key="name"
          />
          <br>
          <br>
          <ElButton
            plain
            @click="addNewVoter"
          >
            新增
          </ElButton>
        </template>
        <template v-if="studentIdStatus == studentIdStatusEnum.Found">
          <ElText
            class="mx-1"
            size="large"
          >
            系別&nbsp; : &nbsp;{{ voterData!.department }} &nbsp;&nbsp;
          </ElText>
          <ElAutocomplete
            v-model="departmentInput"
            :fetch-suggestions="queryAllDepartment"
            class="inline-input w-50"
            :placeholder="`改動學號${queryInputData}系別`"
            value-key="name"
          />
          <ElButton @click="modifyDepartment">修改</ElButton>
          <br>
          <br>
          <ElButton
            type="danger"
            @click="deleteVoterData"
            >刪除此投票者資料</ElButton
          >
        </template>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <ElButton
            type="primary"
            @click="dataChangeDialogVisible = false"
          >
            關閉頁面
          </ElButton>
        </div>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import type { UploadInstance } from "element-plus";
import { Search } from "@element-plus/icons-vue";

definePageMeta({
  middleware: ["admin"],
  title: "管理投票者",
});

const dataChangeDialogVisible = ref(false);
const deleteAllVoterDialogVisible = ref(false);
const queryInput = ref("");
const departmentInput = ref("");
const queryInputData = ref("");

enum studentIdStatusEnum {
  noInput,
  notFound,
  Found,
}

enum FailReason {
  DuplicateStudentId = 1,
  DepartmentNotExist = 2,
  InvalidStudentId = 3,
}

const studentIdStatus = ref(studentIdStatusEnum.noInput);

const voterData: Ref<{
  id: number;
  department: string;
} | null> = ref(null);

const uploadRef = ref<UploadInstance>();

const submitUpload = () => {
  uploadRef.value!.submit();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errHandle = (err: any) => {
  if (err.value.data == null || "" + err.value.data.message == "undefined") {
    return " 發生未知錯誤";
  } else {
    return " " + err.value.data.message;
  }
};

const { data: voterCount, refresh: voterCountRefresh } =
  await useFetch("/api/voter/getCnt");

const uploadFunc = async (item: { file: File }) => {
  const file = item.file;
  const fileType = file.name.substring(file.name.lastIndexOf("."));
  if (fileType !== ".xlsx") {
    ElMessage.error("錯誤:僅能上傳.xlsx文件");
    uploadRef.value!.clearFiles();
    return false;
  }
  const formData = new FormData();
  const infoMessage = ElMessage({
    message: "上傳檔案中",
    type: "info",
    duration: 0,
  });
  formData.append("file", file);
  const { data: failAddingVoter, error } = await useFetch("/api/voter/upload", {
    method: "POST",
    body: formData,
  });

  infoMessage.close();
  if (error.value) {
    ElMessage.error("上傳失敗" + errHandle(error));
  } else {
    ElMessage.success("上傳成功");
  }

  if (failAddingVoter.value && failAddingVoter.value.length != 0) {
    let errorMessage = "無法新增下列投票者:<br>";
    for (let i = 0; i < failAddingVoter.value.length; i++) {
      errorMessage += `學號: ${failAddingVoter.value[i].id} 原因: `;
      if (failAddingVoter.value[i].reason == FailReason.DuplicateStudentId) {
        errorMessage += "此名單學號重複<br>";
      } else if (
        failAddingVoter.value[i].reason == FailReason.DepartmentNotExist
      ) {
        errorMessage += "系所不存在<br>";
      } else if (
        failAddingVoter.value[i].reason == FailReason.InvalidStudentId
      ) {
        errorMessage += "學號格式錯誤<br>";
      } else {
        errorMessage += "未知錯誤<br>";
      }
    }
    ElMessage({
      dangerouslyUseHTMLString: true,
      showClose: true,
      message: errorMessage,
      type: "warning",
      duration: 0,
    });
  }

  voterCountRefresh();
  uploadRef.value!.clearFiles();
};

const queryStudentData = async () => {
  queryInputData.value = queryInput.value;
  const { data: res, error } = await useFetch(
    "/api/voter/getVoterAndDepartment",
    {
      query: { voter: parseInt(queryInput.value) },
    },
  );
  if (error.value) {
    studentIdStatus.value = studentIdStatusEnum.notFound;
    return;
  }
  voterData.value = res.value;
  studentIdStatus.value = studentIdStatusEnum.Found;
  departmentInput.value = "";
};

const refreshVoterData = async () => {
  if (voterData.value) {
    voterData.value.department = "等待刷新中";
  }
  const { data: res, error } = await useFetch(
    "/api/voter/getVoterAndDepartment",
    {
      query: { voter: parseInt(queryInput.value) },
    },
  );
  if (error.value) {
    studentIdStatus.value = studentIdStatusEnum.notFound;
    return;
  }
  voterData.value = res.value;
  studentIdStatus.value = studentIdStatusEnum.Found;
  departmentInput.value = "";
  voterCountRefresh();
};

const modifyDepartment = async () => {
  const { error } = await useFetch("/api/voter/modify", {
    method: "POST",
    body: {
      voterId: parseInt(queryInputData.value),
      voterDepartment: departmentInput.value,
    },
  });
  if (error.value) {
    ElMessage.error("修改失敗" + errHandle(error));
  } else {
    ElMessage.success("修改成功");
  }
  refreshVoterData();
};

const deleteAllVoter = async () => {
  const { error } = await useFetch("/api/voter/delAll", {
    method: "DELETE",
  });
  deleteAllVoterDialogVisible.value = false;
  voterCountRefresh();
  if (error.value) {
    ElMessage.error("刪除失敗" + errHandle(error));
  } else {
    ElMessage.success("刪除成功");
  }
};

const deleteVoterData = async () => {
  const { error } = await useFetch("/api/voter/del", {
    method: "DELETE",
    query: { id: queryInputData.value },
  });
  queryInput.value = "";
  studentIdStatus.value = studentIdStatusEnum.noInput;
  voterCountRefresh();

  if (error.value) {
    ElMessage.error("刪除失敗" + errHandle(error));
  } else {
    ElMessage.success("刪除成功");
  }
};

const uploadSubmit = async () => {
  submitUpload();
};

const addNewVoter = async () => {
  const addNewStudentId = queryInputData.value;
  const addNewDepartment = departmentInput.value;
  const { error } = await useFetch("/api/voter/add", {
    method: "PUT",
    query: {
      id: addNewStudentId,
      department: addNewDepartment,
    },
  });
  if (error.value) {
    ElMessage.error("新增失敗" + errHandle(error));
  } else {
    ElMessage.success("新增成功");
  }
  refreshVoterData();
};

interface Department {
  id: number;
  name: string;
}

const departmentList = ref<Department[]>([]);

const queryAllDepartment = (
  queryString: string,
  cb: (results: { id: number; name: string }[]) => void,
) => {
  const results = queryString
    ? departmentList.value.filter(createFilter(queryString))
    : departmentList.value;
  cb(results);
};

const createFilter = (queryString: string) => {
  return (department: Department) => {
    return department.name.indexOf(queryString) === 0;
  };
};

onMounted(async () => {
  departmentList.value = await loadAll();
});

const loadAll = async () => {
  const { data: departments, error } = await useFetch(
    "/api/department/getAll"
  );
  if (error.value) {
    ElMessage.error("獲取系所列表失敗" + errHandle(error));
  }
  return departments.value!;
};
</script>
