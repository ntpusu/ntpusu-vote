<template>
  <div style="text-align: -webkit-center">
    <el-text
      class="mx-1"
      size="large"
      >上傳投票者名單</el-text
    >
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

      <el-button
        class="ml-3"
        type="success"
        @click="uploadSubmit"
      >
        上傳至伺服器端
      </el-button>

      <template #tip>
        <div class="el-upload__tip">僅能上傳 .xlsx 文件</div>
      </template>
    </el-upload>
    <el-text
      class="mx-1"
      size="large"
      >目前系統內已有{{ voterCount }}筆投票者資料</el-text
    >
    <br>
    <br>
    <el-button
      type="danger"
      round
      @click="deleteAllVoterDialogVisible = true"
    >
      刪除所有投票者資料
    </el-button>
    <el-dialog
      v-model="deleteAllVoterDialogVisible"
      title="確認要刪除所有投票者嗎?"
      width="500"
    >
      <span>刪除後將無法復原</span>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="deleteAllVoterDialogVisible = false"
            >取消</el-button
          >
          <el-button
            type="danger"
            @click="deleteAllVoter"
          >
            確認刪除
          </el-button>
        </div>
      </template>
    </el-dialog>
    <br>
    <br>
    <el-button
      plain
      @click="dataChangedialogVisible = true"
    >
      個別資料更動
    </el-button>

    <el-dialog
      v-model="dataChangedialogVisible"
      title="更動頁面"
      width="500"
    >
      <div style="text-align: -webkit-center">
        <el-input
          v-model="queryInput"
          style="width: 240px"
          size="large"
          placeholder="請輸入學號"
        />
        <el-button
          :icon="Search"
          size="large"
          @click="queryStudentData"
          >查詢</el-button
        >
        <br><br>
        <template v-if="queryInputData !== ''">
          <el-text
            class="mx-1"
            type="info"
            >當前為學號{{ queryInputData }}的資料</el-text
          >
        </template>
        <br><br>
        <template v-if="studentIdStatus == studentIdStatusEnum.notFound">
          <el-text
            class="mx-1"
            size="large"
            type="danger"
          >
            資料不存在
          </el-text>
          <br>
          <br>
          <el-text
            class="mx-1"
            size="large"
          >
            新增資料
          </el-text>
          <br>
          <el-autocomplete
            v-model="departmentInput"
            :fetch-suggestions="queryAllDepartment"
            class="inline-input w-50"
            :placeholder="`學號${queryInputData}的系別`"
            value-key="name"
          />
          <br>
          <br>
          <el-button
            plain
            @click="addNewVoter"
          >
            新增
          </el-button>
        </template>
        <template v-if="studentIdStatus == studentIdStatusEnum.Found">
          <el-text
            class="mx-1"
            size="large"
          >
            系別&nbsp; : &nbsp;{{ voterData!.department }} &nbsp;&nbsp;
          </el-text>
          <el-autocomplete
            v-model="departmentInput"
            :fetch-suggestions="queryAllDepartment"
            class="inline-input w-50"
            :placeholder="`改動學號${queryInputData}系別`"
            value-key="name"
          />
          <el-button @click="modifyDepartment">修改</el-button>
          <br>
          <br>
          <el-button
            type="danger"
            @click="deleteVoterData"
            >刪除此投票者資料</el-button
          >
        </template>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button
            type="primary"
            @click="dataChangedialogVisible = false"
          >
            關閉頁面
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { UploadInstance } from "element-plus";
import { Search } from "@element-plus/icons-vue";

const dataChangedialogVisible = ref(false);
const deleteAllVoterDialogVisible = ref(false);
const queryInput = ref("");
const departmentInput = ref("");
const queryInputData = ref("");

enum studentIdStatusEnum {
  noInput,
  notFound,
  Found,
}

const studentIdStatus = ref(
  studentIdStatusEnum.noInput,
); /* 0: no input, 1 : not found, 2 : found data */

const voterData: Ref<{
  id: number;
  department: string;
} | null> = ref(null);

definePageMeta({
  middleware: ["admin"],
  title: "管理投票者頁面",
});

const uploadRef = ref<UploadInstance>();

const submitUpload = () => {
  uploadRef.value!.submit();
};

const { data: voterCount, refresh: voterCountRefresh } =
  await useFetch("/api/getVoterCnt");

const uploadfunc = async (item: { file: File }) => {
  const file = item.file;
  const fileType = file.name.substring(file.name.lastIndexOf("."));
  if (fileType !== ".xlsx") {
    ElMessage.error("錯誤:僅能上傳.xlsx文件");
    uploadRef.value!.clearFiles();
    return false;
  }
  const formData = new FormData();

  formData.append("file", file);
  const { data: failAddingVoter, error: uploadingFileError } = await useFetch(
    "/api/uploadVoter",
    {
      method: "POST",
      body: formData,
    },
  );

  if (uploadingFileError.value) {
    ElMessage.error("上傳失敗");
  } else {
    ElMessage.success("上傳成功");
  }

  if (failAddingVoter.value && failAddingVoter.value.length != 0) {
    let errorMessage = "無法新增以下投票者<br>學號列表:<br>";
    for (let i = 0; i < failAddingVoter.value.length; i++) {
      errorMessage += `${failAddingVoter.value[i].id}`;
      if(i != failAddingVoter.value.length - 1) {
        errorMessage += '、'
      }
    }
    ElMessage({
      dangerouslyUseHTMLString: true,
      showClose: true,
      message: errorMessage, //'無法新增以下投票者' + (failAddingVoter.value as failAddingVoterType[]).toString(),
      type: "warning",
      duration: 0,
    });
  }

  voterCountRefresh();
  uploadRef.value!.clearFiles();
};

const queryStudentData = async () => {
  queryInputData.value = queryInput.value;
  const { data: res, error: getVoterError } = await useFetch(
    "/api/getVoterAndDepartment",
    {
      method: "GET",
      query: { voter: parseInt(queryInput.value) },
    },
  );
  if (getVoterError.value) {
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
  const { data: res, error: getVoterError } = await useFetch(
    "/api/getVoterAndDepartment",
    {
      method: "GET",
      query: { voter: parseInt(queryInput.value) },
    },
  );
  if (getVoterError.value) {
    studentIdStatus.value = studentIdStatusEnum.notFound;
    return;
  }
  voterData.value = res.value;
  studentIdStatus.value = studentIdStatusEnum.Found;
  departmentInput.value = "";
  voterCountRefresh();
};

const modifyDepartment = async () => {
  const { error: modifyDepartmentError } = await useFetch("/api/modifyVoter", {
    method: "POST",
    body: {
      voterId: parseInt(queryInputData.value),
      voterDepartment: departmentInput.value,
    },
  });
  if (modifyDepartmentError.value) {
    ElMessage.error("修改失敗");
  } else {
    ElMessage.success("修改成功");
  }
  refreshVoterData();
};

const deleteAllVoter = async () => {
  const { error: delAllVoterError } = await useFetch("/api/delAllVoter", {
    method: "DELETE",
  });
  deleteAllVoterDialogVisible.value = false;
  voterCountRefresh();
  if (delAllVoterError.value) {
    ElMessage.error("刪除失敗");
  } else {
    ElMessage.success("刪除成功");
  }
};

const deleteVoterData = async () => {
  const { error: deleteVoterError } = await useFetch("/api/delVoter", {
    method: "DELETE",
    query: { id: queryInputData.value },
  });
  queryInput.value = "";
  studentIdStatus.value = studentIdStatusEnum.noInput;
  voterCountRefresh();

  if (deleteVoterError.value) {
    ElMessage.error("刪除失敗");
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
  const { error: addNewVoterError } = await useFetch("api/addVoter", {
    method: "PUT",
    query: {
      id: addNewStudentId,
      department: addNewDepartment,
    },
  });
  if (addNewVoterError.value) {
    ElMessage.error("新增失敗");
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
  // call callback function to return suggestions
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
  const { data: departments } = await useFetch("/api/getAllDepartment", {
    method: "GET",
  });
  return departments.value!;
};
</script>
