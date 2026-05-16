<template>
  <div class="mx-auto max-w-2xl rounded-xl border-4 border-blue-100 p-5">
    <ElForm
      label-width="auto"
      label-suffix=":"
      :model="siteInfoForm"
    >
      <ElFormItem label="選舉公報連結">
        <ElInput
          v-model="siteInfoForm.bulletinUrl"
          placeholder="請輸入 Google Drive preview 連結"
          clearable
        />
      </ElFormItem>
      <ElFormItem label="操作說明來源">
        <ElSegmented
          v-model="siteInfoForm.guideSource"
          :options="guideSourceOptions"
        />
      </ElFormItem>
      <ElFormItem label="操作說明連結">
        <ElInput
          v-model="siteInfoForm.guideUrl"
          :placeholder="guideUrlPlaceholder"
          clearable
        />
      </ElFormItem>
      <ElFormItem>
        <ElButton
          type="primary"
          :loading="saving"
          @click="saveSiteInfo"
        >
          <span class="font-bold">儲 存</span>
        </ElButton>
      </ElFormItem>
    </ElForm>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["admin"],
  title: "管理資訊",
});

const guideSourceOptions = [
  {
    label: "Instagram",
    value: "instagram",
  },
  {
    label: "Google Drive",
    value: "gdrive",
  },
];

interface SiteInfo {
  bulletinUrl: string;
  guideUrl: string;
  guideSource: "instagram" | "gdrive";
}

const { data: siteInfo } = await useFetch<SiteInfo>("/api/siteInfo/get");
const saving = ref(false);

const siteInfoForm = reactive({
  bulletinUrl: siteInfo.value?.bulletinUrl ?? "",
  guideUrl: siteInfo.value?.guideUrl ?? "",
  guideSource: siteInfo.value?.guideSource ?? "instagram",
});

const guideUrlPlaceholder = computed(() =>
  siteInfoForm.guideSource === "instagram"
    ? "請輸入 Instagram 貼文連結"
    : "請輸入 Google Drive preview 連結",
);

const saveSiteInfo = async () => {
  saving.value = true;

  await $fetch("/api/siteInfo/update", {
    method: "PUT",
    body: siteInfoForm,
  })
    .then(() => {
      ElMessage.success("儲存成功");
    })
    .catch(() => {
      ElMessage.error("儲存失敗");
    })
    .finally(() => {
      saving.value = false;
    });
};
</script>
