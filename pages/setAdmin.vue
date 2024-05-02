<template>
  <div>
    <template v-if="!adminPending">
      <div
        v-for="(adminItem, index) in admin"
        :key="index"
        class="flex justify-center"
      >
        {{ adminItem.id }}
      </div>
    </template>
    <ElSkeleton
      v-else
      animated
    />
    <ElButton @click="adminRefresh()">
      <span class="font-bold">刷 新</span>
    </ElButton>
    <ElDivider />
    <div class="flex justify-center">
      <div class="mb-4 w-[500px]">
        <ElInput
          v-model="addId"
          placeholder="請輸入ID"
          clearable
        />
      </div>
      <ElButton
        v-if="!adminPending"
        type="primary"
        @click="addAdmin"
      >
        <span class="font-bold">新 增</span>
      </ElButton>
    </div>
    <ElDivider />
    <div class="flex justify-center">
      <div class="mb-4 w-[500px]">
        <ElInput
          v-model="addId"
          placeholder="請輸入ID"
          clearable
        />
      </div>
      <ElButton
        v-if="!adminPending"
        type="primary"
        @click="delAdmin"
      >
        <span class="font-bold">刪 除</span>
      </ElButton>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["super-admin"],
  title: "設定管理員",
});

const {
  data: admin,
  pending: adminPending,
  refresh: adminRefresh,
} = await useLazyFetch("/api/getAdmin");

const addId = ref("");
const delId = ref("");

const addAdmin = async () => {
  await useFetch("/api/addAdmin", {
    method: "PUT",
    query: { id: addId.value },
  })
    .then(async () => {
      ElMessage.success("新增成功");
      await adminRefresh();
    })
    .catch(() => {
      ElMessage.error("新增失敗");
    })
    .finally(() => {
      addId.value = "";
    });
};

const delAdmin = async () => {
  await useFetch("/api/delAdmin", {
    method: "DELETE",
    query: { id: delId.value },
  })
    .then(async () => {
      ElMessage.success("刪除成功");
      await adminRefresh();
    })
    .catch(() => {
      ElMessage.error("刪除失敗");
    })
    .finally(() => {
      delId.value = "";
    });
};
</script>
