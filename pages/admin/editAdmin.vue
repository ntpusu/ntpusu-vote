<template>
  <div class="mx-auto max-w-3xl">
    <ElTabs>
      <ElTabPane
        label="管理員"
        name="admin"
      >
        <template v-if="!adminPending">
          <ElTable
            :data="admin"
            empty-text="目前沒有管理員"
          >
            <ElTableColumn
              prop="id"
              label="學號"
            />
          </ElTable>
        </template>
        <ElSkeleton
          v-else
          animated
        />
        <ElButton
          class="mt-4"
          @click="adminRefresh()"
        >
          <span class="font-bold">刷 新</span>
        </ElButton>
        <ElDivider />
        <div class="flex justify-center">
          <div class="m-4 w-[500px]">
            <ElInput
              v-model="addId"
              placeholder="請輸入管理員學號"
              clearable
            />
          </div>
          <ElButton
            v-if="!adminPending"
            type="primary"
            class="my-auto"
            @click="addAdmin"
          >
            <span class="font-bold">新 增</span>
          </ElButton>
        </div>
        <ElDivider />
        <div class="flex justify-center">
          <div class="m-4 w-[500px]">
            <ElInput
              v-model="delId"
              placeholder="請輸入管理員學號"
              clearable
            />
          </div>
          <ElButton
            v-if="!adminPending"
            type="primary"
            class="my-auto"
            @click="delAdmin"
          >
            <span class="font-bold">刪 除</span>
          </ElButton>
        </div>
      </ElTabPane>
      <ElTabPane
        label="超級管理員"
        name="superAdmin"
      >
        <ElAlert
          title="超級管理員重設之後將把資料庫清除，請只用在交接上"
          type="warning"
          show-icon
          :closable="false"
          class="mb-4"
        />
        <template v-if="!superAdminPending">
          <ElTable
            :data="superAdmins"
            empty-text="目前沒有超級管理員"
          >
            <ElTableColumn
              prop="id"
              label="學號"
            />
          </ElTable>
        </template>
        <ElSkeleton
          v-else
          animated
        />
        <ElButton
          class="mt-4"
          @click="superAdminRefresh()"
        >
          <span class="font-bold">刷 新</span>
        </ElButton>
        <ElDivider />
        <div class="flex justify-center">
          <div class="m-4 w-[500px]">
            <ElInput
              v-model="addSuperAdminId"
              placeholder="請輸入新任超級管理員學號"
              clearable
            />
          </div>
          <ElButton
            v-if="!superAdminPending"
            type="danger"
            class="my-auto"
            @click="resetSuperAdmin"
          >
            <span class="font-bold">重 設</span>
          </ElButton>
        </div>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ["super-admin"],
  title: "設定管理員",
});

interface AdminItem {
  id: number;
}

const {
  data: admin,
  pending: adminPending,
  refresh: adminRefresh,
} = await useLazyFetch<AdminItem[]>("/api/admin/getAll", {
  default: () => [],
});

const {
  data: superAdmins,
  pending: superAdminPending,
  refresh: superAdminRefresh,
} = await useLazyFetch<AdminItem[]>("/api/superAdmin/getAll", {
  default: () => [],
});

const addId = ref("");
const delId = ref("");
const addSuperAdminId = ref("");

const addAdmin = async () => {
  await $fetch("/api/admin/add", {
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
  await $fetch("/api/admin/del", {
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

const resetSuperAdmin = async () => {
  const newSuperAdminId = Number(addSuperAdminId.value);

  if (!Number.isInteger(newSuperAdminId)) {
    ElMessage.error("請輸入有效學號");
    return;
  }

  try {
    await ElMessageBox.confirm(
      "超級管理員重設之後將把資料庫清除，請只用在交接上。確定要繼續嗎？",
      "重設超級管理員",
      {
        confirmButtonText: "確定重設",
        cancelButtonText: "取消",
        type: "warning",
      },
    );
  } catch {
    return;
  }

  await $fetch("/api/superAdmin/add", {
    method: "PUT",
    query: { id: newSuperAdminId },
  })
    .then(() => {
      admin.value = [];
      superAdmins.value = [{ id: newSuperAdminId }];
      ElMessage.success("重設成功");
    })
    .catch(() => {
      ElMessage.error("重設失敗");
    })
    .finally(() => {
      addSuperAdminId.value = "";
    });
};
</script>
