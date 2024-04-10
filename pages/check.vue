<template>
  <div class="flex flex-col md:my-[25vh] md:flex-row">
    <ElForm
      label-width="auto"
      label-suffix=":"
      hide-required-asterisk
      class="m-auto flex w-full flex-col items-center justify-center py-10"
    >
      <ElFormItem
        label="學號"
        class="m-auto w-5/6"
      >
        <ElInput
          v-model="voter"
          placeholder="請輸入學號"
          clearable
        />
      </ElFormItem>
      <ElButton
        type="primary"
        class="w-1/5 !rounded-md"
        @click="searchVoter"
      >
        <span class="font-bold">查 詢</span>
      </ElButton>
      <ClientOnly>
        <ElDialog
          v-if="voterData"
          title="選舉人資訊"
          center
          align-center
          v-model="voterShow"
          class="!w-fit !rounded-lg px-5"
        >
          <div class="flex flex-col flex-wrap items-start justify-center">
            <h1 class="text-lg font-bold">學號：{{ voterData.id }}</h1>
            <h1 class="text-lg font-bold">範圍：{{ voterData.group }}</h1>
            <h1 class="text-lg font-bold">
              是否登入：{{ voterData.first.serNum ? "是" : "否" }}
            </h1>
            <h1
              v-if="voterData.first.serNum"
              class="text-lg font-bold"
            >
              第 {{ voterData.first.serNum }} 個登入者
            </h1>
            <h1
              v-if="voterData.first.time"
              class="text-lg font-bold"
            >
              登入時間：{{ new Date(voterData.first.time).toLocaleString() }}
            </h1>
          </div>
        </ElDialog>
      </ClientOnly>
    </ElForm>
    <ElDivider class="md:!hidden" />
    <ElForm
      label-width="auto"
      label-suffix=":"
      hide-required-asterisk
      class="m-auto flex w-full flex-col items-center justify-center py-10"
    >
      <ElFormItem
        label="憑證"
        class="m-auto w-5/6"
      >
        <ElInput
          v-model="token"
          placeholder="請輸入憑證"
          clearable
        />
      </ElFormItem>
      <ElButton
        type="primary"
        class="w-1/5 !rounded-md"
        @click="searchToken"
      >
        <span class="font-bold">查 詢</span>
      </ElButton>
      <ClientOnly>
        <ElDialog
          v-if="tokenData"
          title="選票資訊"
          center
          align-center
          v-model="tokenShow"
          class="!w-fit !rounded-lg px-5"
        >
          <div class="flex flex-col flex-wrap items-start justify-center">
            <h1 class="text-lg font-bold">項目：{{ tokenData.vote }}</h1>
            <h1 class="text-lg font-bold">選擇：{{ tokenData.candidate }}</h1>
            <h1 class="text-lg font-bold">
              時間：{{ new Date(tokenData.time).toLocaleString() }}
            </h1>
          </div>
        </ElDialog>
      </ClientOnly>
    </ElForm>
    <ElDivider class="md:!hidden" />
    <ElForm
      label-width="auto"
      label-suffix=":"
      hide-required-asterisk
      class="m-auto flex w-full flex-col items-center justify-center py-10"
    >
      <ElFormItem
        label="投票"
        class="m-auto"
      >
        <ClientOnly>
          <ElSelect
            v-model="VG.votingId"
            placeholder="請選擇投票項目"
            clearable
          >
            <el-option
              v-for="item in voting"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
        </ClientOnly>
      </ElFormItem>
      <ElFormItem
        label="範圍"
        class="m-auto"
      >
        <ClientOnly>
          <ElSelect
            v-model="VG.groupId"
            placeholder="請選擇投票範圍"
            clearable
          >
            <el-option
              v-for="item in group"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </ElSelect>
        </ClientOnly>
      </ElFormItem>
      <ElButton
        type="primary"
        class="w-1/5 !rounded-md"
        @click="searchVG"
      >
        <span class="font-bold">查 詢</span>
      </ElButton>
      <ClientOnly>
        <ElDialog
          v-if="VGData"
          title="投票範圍資訊"
          align-center
          v-model="VGShow"
          class="!w-fit !rounded-lg px-5"
        >
          <div class="flex flex-col flex-wrap items-start justify-center">
            <h1 class="text-lg font-bold">投票：{{ VGData.Vname }}</h1>
            <h1 class="text-lg font-bold">範圍：{{ VGData.Gname }}</h1>
            <h1 class="text-lg font-bold">票數：{{ VGData.cnt }}</h1>
          </div>
        </ElDialog>
      </ClientOnly>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  title: "查詢",
});

const { data: voting } = await useFetch("/api/getVoting");
const { data: group } = await useFetch("/api/getGroup");

const voter = ref("");
const token = ref("");
const VG = reactive<{
  votingId: number | undefined;
  groupId: number | undefined;
}>({
  votingId: undefined,
  groupId: undefined,
});

const voterShow = ref(false);
const tokenShow = ref(false);
const VGShow = ref(false);

const voterData: Ref<{
  id: number;
  group: string;
  first: {
    serNum: number | undefined;
    time: string | undefined;
  };
} | null> = ref(null);

const tokenData: Ref<{
  vote: string;
  candidate: string;
  time: string;
} | null> = ref(null);

const VGData: Ref<{
  Vname: string;
  Gname: string;
  cnt: number;
} | null> = ref(null);

const searchVoter = async () => {
  if (voter.value == "") {
    ElMessage({
      message: "請輸入學號",
      type: "warning",
    });
    return;
  }

  const res = await useFetch("/api/getVoter", {
    query: { voter: voter.value },
  });

  if (res.error.value) {
    ElMessage({
      message: "查無此人",
      type: "warning",
    });
    return;
  }

  voterData.value = res.data.value;

  voterShow.value = true;
};

const searchToken = async () => {
  if (token.value == "") {
    ElMessage({
      message: "請輸入憑證",
      type: "warning",
    });
    return;
  }

  const res = await useFetch("/api/getBallot", {
    query: { token: token.value },
  });

  if (res.error.value) {
    ElMessage({
      message: "無此憑證或投票尚未結束",
      type: "warning",
    });
    return;
  }

  tokenData.value = res.data.value;

  tokenShow.value = true;
};

const searchVG = async () => {
  if (VG.votingId === undefined || VG.groupId === undefined) {
    ElMessage({
      message: "請輸入投票及範圍",
      type: "warning",
    });
    return;
  }

  const res = await useFetch("/api/getVotingGroupCnt", {
    query: { votingId: VG.votingId, groupId: VG.groupId },
  });

  if (res.error.value) {
    ElMessage({
      message: "投票尚未結束",
      type: "warning",
    });
    return;
  }

  VGData.value = res.data.value;

  VGShow.value = true;
};
</script>
