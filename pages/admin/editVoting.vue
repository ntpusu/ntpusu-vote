<template>
  <div>
    <div
      class="m-auto flex w-full justify-center rounded-xl border-4 border-green-200 p-5 sm:w-7/12 md:w-1/2 lg:w-5/12 xl:w-1/3 2xl:w-1/4"
    >
      <ElForm
        ref="formRef"
        label-width="auto"
        label-suffix=":"
        :model="addVote"
        :rules="rules"
        hide-required-asterisk
        @keyup.enter.capture="submitForm(formRef)"
      >
        <ElFormItem
          label="名稱"
          prop="voteName"
        >
          <ElSpace>
            <ElInput
              v-model="addVote.voteName"
              placeholder="請輸入名稱"
              class="!w-48"
            />
          </ElSpace>
        </ElFormItem>
        <ElFormItem
          label="範圍"
          prop="voteGroup"
        >
          <ClientOnly>
            <ElSelect
              v-model="addVote.voteGroup"
              placeholder="請選擇投票範圍"
              clearable
              class="!w-48"
            >
              <ElOption
                v-for="item in groupOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </ElSelect>
          </ClientOnly>
        </ElFormItem>
        <ElFormItem
          label="開始時間"
          prop="startTime"
        >
          <ClientOnly>
            <ElDatePicker
              v-model="addVote.startTime"
              type="datetime"
              placeholder="請選擇開始時間"
              format="YYYY/MM/DD HH:mm:ss"
              class="!w-48"
            />
          </ClientOnly>
        </ElFormItem>
        <ElFormItem
          label="結束時間"
          prop="endTime"
        >
          <ClientOnly>
            <ElDatePicker
              v-model="addVote.endTime"
              type="datetime"
              placeholder="請選擇結束時間"
              format="YYYY/MM/DD HH:mm:ss"
              class="!w-48"
            />
          </ClientOnly>
        </ElFormItem>
        <ElFormItem
          label="是否單選"
          prop="onlyOne"
        >
          <ElSwitch
            v-model="addVote.onlyOne"
            inline-prompt
            active-text="是"
            inactive-text="否"
            @change="onlyOneChange"
          />
        </ElFormItem>
        <div
          v-for="(candidate, index) in addVote.candidates"
          :key="index"
          class="flex items-center"
        >
          <ElFormItem
            :key="index"
            :prop="'candidates.' + index + '.name'"
            :label="addVote.onlyOne ? '候選人名稱' : index + 1 + '號名稱'"
            :rules="{
              validator: checkOptionWords,
              trigger: 'blur'
            }"
            class="!mb-4"
          >
            <ElInput
              v-model="candidate.name"
              placeholder="請輸入選項名稱"
              class="!w-48"
            />
          </ElFormItem>
          <ElButton
            type="danger"
            plain
            round
            :class="{ invisible: index < 2 }"
            class="mb-4 ml-2"
            @click="removeDomain(candidate)"
          >
            <span class="font-bold">X</span>
          </ElButton>
        </div>
        <ElFormItem class="mt-3">
          <ElSpace class="m-auto">
            <ElButton
              v-if="!addVote.onlyOne"
              @click="addDomain"
            >
              <span class="font-bold">新增選項</span>
            </ElButton>
            <ElButton
              type="primary"
              @click="submitForm(formRef)"
            >
              <span class="font-bold">創 建</span>
            </ElButton>
          </ElSpace>
        </ElFormItem>
      </ElForm>
    </div>
    <ElDivider />
    <div class="flex justify-center">
      <ElSwitch
        v-model="showTime"
        class="mx-3 mb-8"
        size="large"
        inline-prompt
        active-text="時間"
        inactive-text="時間"
      />
      <ElSwitch
        v-model="showOption"
        class="mx-3 mb-8"
        size="large"
        inline-prompt
        active-text="操作"
        inactive-text="操作"
      />
    </div>
    <template v-if="!votingPending">
      <div
        class="m-auto w-full rounded-xl border-4 border-blue-100 p-5 md:w-11/12 lg:w-5/6 xl:w-2/3 2xl:w-1/2"
      >
        <ClientOnly>
          <ElTable
            :data="tableData()"
            border
            table-layout="auto"
            empty-text="Empty~~~"
            size="small"
          >
            <div
              prop="id"
              class="hidden"
            />
            <div
              prop="startTime"
              class="hidden"
            />
            <div
              prop="endTime"
              class="hidden"
            />
            <ElTableColumn
              prop="title"
              label="名稱"
              align="center"
            />
            <ElTableColumn
              prop="group"
              label="投票範圍"
              align="center"
            />
            <ElTableColumn
              v-if="showTime"
              prop="startTimeStr"
              label="開始時間"
              align="center"
            />
            <ElTableColumn
              v-if="showTime"
              prop="endTimeStr"
              label="結束時間"
              align="center"
            />
            <ElTableColumn
              v-if="showOption"
              label="結果"
              class="min-w-fit"
              align="center"
            >
              <template #default="{ row }">
                <ElButton
                  size="small"
                  type="success"
                  :disabled="Date.now() <= new Date(row.endTime).getTime()"
                  @click="useRouter().push('/result/' + row.id)"
                >
                  <span class="font-bold">結 果</span>
                </ElButton>
              </template>
            </ElTableColumn>
            <ElTableColumn
              v-if="showOption"
              label="封存"
              class="min-w-fit"
              align="center"
            >
              <template #default="{ row }">
                <ElPopconfirm
                  title="確定要封存嗎？"
                  cancel-button-text="取消"
                  confirm-button-text="確定"
                  @confirm="handleArchive(row.id)"
                >
                  <template #reference>
                    <ElButton
                      size="small"
                      type="warning"
                    >
                      <span class="font-bold">封 存</span>
                    </ElButton>
                  </template>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>
        </ClientOnly>
      </div>
      <ElDivider border-style="dashed" />
      <div
        class="m-auto w-full rounded-xl border-4 border-red-100 p-5 md:w-11/12 lg:w-5/6 xl:w-2/3 2xl:w-1/2"
      >
        <ClientOnly>
          <ElTable
            :data="archiveData()"
            border
            table-layout="auto"
            empty-text="Empty~~~"
            size="small"
          >
            <div
              prop="id"
              class="hidden"
            />
            <div
              prop="startTime"
              class="hidden"
            />
            <div
              prop="endTimeStr"
              class="hidden"
            />
            <ElTableColumn
              prop="title"
              label="名稱"
              align="center"
            />
            <ElTableColumn
              prop="group"
              label="投票範圍"
              align="center"
            />
            <ElTableColumn
              v-if="showTime"
              prop="startTimeStr"
              label="開始時間"
              align="center"
            />
            <ElTableColumn
              v-if="showTime"
              prop="endTimeStr"
              label="結束時間"
              align="center"
            />
            <ElTableColumn
              v-if="showOption"
              label="解除封存"
              class="min-w-fit"
              align="center"
            >
              <template #default="{ row }">
                <ElPopconfirm
                  title="確定要解封嗎？"
                  cancel-button-text="取消"
                  confirm-button-text="確定"
                  @confirm="handleUnarchive(row.id)"
                >
                  <template #reference>
                    <ElButton
                      size="small"
                      type="primary"
                    >
                      <span class="font-bold">解除封存</span>
                    </ElButton>
                  </template>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
            <ElTableColumn
              v-if="showOption"
              label="刪除"
              class="min-w-fit"
              align="center"
            >
              <template #default="{ row }">
                <ElPopconfirm
                  title="確定要刪除嗎？"
                  cancel-button-text="取消"
                  confirm-button-text="確定"
                  @confirm="handleDelete(row.id)"
                >
                  <template #reference>
                    <ElButton
                      size="small"
                      type="danger"
                    >
                      <span class="font-bold">刪 除</span>
                    </ElButton>
                  </template>
                </ElPopconfirm>
              </template>
            </ElTableColumn>
          </ElTable>
        </ClientOnly>
      </div>
    </template>
    <ElDivider />
    <div class="flex flex-col items-center">
      <ElPopconfirm
        title="確定要重設登入數量嗎？"
        cancel-button-text="取消"
        confirm-button-text="確定"
        @confirm="handleLoginReset"
      >
        <template #reference>
          <ElButton
            type="warning"
            title="重置登入數"
            plain
          >
            <span class="font-bold">重置登入</span>
          </ElButton>
        </template>
      </ElPopconfirm>
      <div class="p-3">
        目前已登入人數：
        <ElTag>{{ loginCnt }}</ElTag>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from "element-plus";

definePageMeta({
  middleware: ["admin"],
  title: "管理投票",
});

const {
  data: voting,
  pending: votingPending,
  refresh: votingRefresh,
} = await useLazyFetch("/api/voting/getAll");
const { data: Group } = await useFetch("/api/department/getAllGroup");
const { data: loginCnt, refresh: loginCntRefresh } =
  await useFetch("/api/loginCnt/get");

const showTime = ref(false);
const showOption = ref(true);

const formRef = ref<FormInstance>();

interface Candidate {
  name: string;
}

const addVote = reactive<{
  voteName: string;
  voteGroup: number | undefined;
  startTime: string;
  endTime: string;
  onlyOne: boolean;
  candidates: Candidate[];
}>({
  voteName: "",
  voteGroup: undefined,
  startTime: "",
  endTime: "",
  onlyOne: false,
  candidates: [{ name: "" }, { name: "" }],
});

const onlyOneChange = () => {
  if (addVote.onlyOne) {
    addVote.candidates = [{ name: "" }];
  } else {
    addVote.candidates = [{ name: "" }, { name: "" }];
  }
};

const removeDomain = (item: Candidate) => {
  const index = addVote.candidates.indexOf(item);
  if (index > 1) {
    addVote.candidates.splice(index, 1);
  }
};

const addDomain = () => {
  addVote.candidates.push({ name: "" });
};

const rules = reactive<FormRules>({
  voteName: [{ required: true, message: "名稱為必填", trigger: "blur" }],
  voteGroup: [{ required: true, message: "範圍為必填", trigger: "change" }],
  startTime: [{ required: true, message: "開始時間為必填", trigger: "change" }],
  endTime: [{ required: true, message: "結束時間為必填", trigger: "change" }],
});

const checkOptionWords = (rule: any, value: any, callback: any) =>{
  if(!value){
    callback(new Error('選項為必填'));
  }
  if (value.includes('廢票')) {
    callback(new Error('請重新輸入，不需輸入"廢票"選項'));
  } else{
    callback();
  }
}
const submitForm = async (formRef: FormInstance | undefined) => {
  if (!formRef) return;

  await formRef.validate(async (valid, _fields) => {
    if (valid) {
      await $fetch("/api/voting/add", {
        method: "POST",
        body: JSON.stringify(addVote),
      })
        .then(async () => {
          ElMessage.success("創建成功");
          await votingRefresh();
        })
        .catch(() => {
          ElMessage.error("創建失敗");
        })
        .finally(() => {
          formRef.resetFields();
          onlyOneChange();
        });
    }
  });
};

const groupOptions = computed(() => {
  if (!Group.value) return [];

  return Group.value.map((item) => ({
    label: item.name,
    value: item.id,
  }));
});

const tableData = () => {
  if (!voting.value) return [];

  return voting.value
    .filter((item) => !item.archive)
    .map((item) => ({
      id: item.id,
      title: item.name,
      group: item.group.name,
      startTime: new Date(item.startTime),
      startTimeStr: new Date(item.startTime).toLocaleString(),
      endTime: new Date(item.endTime),
      endTimeStr: new Date(item.endTime).toLocaleString(),
    }));
};

const archiveData = () => {
  if (!voting.value) return [];

  return voting.value
    .filter((item) => item.archive)
    .map((item) => ({
      id: item.id,
      title: item.name,
      group: item.group.name,
      startTime: new Date(item.startTime),
      startTimeStr: new Date(item.startTime).toLocaleString(),
      endTime: new Date(item.endTime),
      endTimeStr: new Date(item.endTime).toLocaleString(),
    }));
};

const handleArchive = async (id: number) => {
  await $fetch("/api/voting/archive", {
    method: "POST",
    body: JSON.stringify({ id }),
  })
    .then(async () => {
      ElMessage.success("封存成功");
      await votingRefresh();
    })
    .catch(() => {
      ElMessage.error("封存失敗");
    });
};

const handleUnarchive = async (id: number) => {
  await $fetch("/api/voting/unarchive", {
    method: "POST",
    body: JSON.stringify({ id }),
  })
    .then(async () => {
      ElMessage.success("解封成功");
      await votingRefresh();
    })
    .catch(() => {
      ElMessage.error("解封失敗");
    });
};

const handleDelete = async (id: number) => {
  await $fetch("/api/voting/del", {
    method: "DELETE",
    query: { id },
  })
    .then(async () => {
      ElMessage.success("刪除成功");
      await votingRefresh();
    })
    .catch(() => {
      ElMessage.error("刪除失敗");
      ElMessage.warning("超級管理員才可以刪除");
    });
};

const handleLoginReset = async () => {
  await $fetch("/api/loginCnt/reset")
    .then(async () => {
      ElMessage.success("重置成功");
      await loginCntRefresh();
    })
    .catch(() => {
      ElMessage.error("重置失敗");
      ElMessage.warning("超級管理員才可以重置");
    });
};
</script>
