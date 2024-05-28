<template>
  <div class="flex flex-wrap justify-center">
    <el-space direction="vertical">
      <el-space direction="vertical">
        <el-text class="mx-1" type="info">預覽修改</el-text>
        <div
          v-if= "!(input.start instanceof Date && input.end instanceof Date)"
        >
          <el-text class="mx-1" type="warning">填寫完整開始時間與結束時間以預覽</el-text>
        </div>
        <ElSteps
          v-if="(input.start instanceof Date) && (input.end instanceof Date)"
          direction="vertical"
          align-center
          space="12vh"
          class="mt-5 w-full !flex-wrap content-center"
        >
          <ElStep
            :status="style(input.start as Date, input.end as Date)"
            class="tracking-[1.5px]"
          >
            <template #title>
              <div class="font-bold sm:text-lg">
                {{ input.content }}
              </div>
            </template>
            <template #description>
              <div class="min-w-max sm:text-base">
                <span>{{
                  input.start.toLocaleString(undefined, {
                    dateStyle: "long",
                    timeStyle: input.showTime ? "medium" : undefined,
                  })
                }}</span>
                <span v-if="input.showEnd"> 〜 </span>
                <span v-if="input.showEnd && !input.showTime">{{
                  input.end.toLocaleString(undefined, {
                    dateStyle: "long",
                    timeStyle: input.showTime ? "medium" : undefined,
                  })
                }}</span>
              </div>
              <div
                v-if="input.showEnd && input.showTime"
                class="min-w-max sm:text-base"
              >
                {{
                  input.end.toLocaleString(undefined, {
                    dateStyle: "long",
                    timeStyle: input.showTime ? "medium" : undefined,
                  })
                }}
              </div>
            </template>
          </ElStep>
        </ElSteps>
      </el-space>
      <el-space direction="vertical">
        <el-form
          ref="formRef"
          label-width="auto"
          label-suffix=":"
          hide-required-asterisk
        >
          <el-form-item label="設定時間軸" prop="content">
            <el-input
              v-model="input.content"
              placeholder="設定內容"
            />
          </el-form-item>
          <el-form-item label="開始時間">
            <el-date-picker
              v-model="input.start"
              type="datetime"
              placeholder="選擇開始時間"
            />
          </el-form-item>
          <el-form-item label="結束時間">
            <el-date-picker
              v-model="input.end"
              type="datetime"
              placeholder="選擇結束時間"
            />
          </el-form-item>
          <el-form-item label="是否顯示詳細時間">
            <el-switch
              v-model="input.showTime"
              inline-prompt
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
          <el-form-item label="是否顯示結束時間">
            <el-switch
              v-model="input.showEnd"
              inline-prompt
              active-text="是"
              inactive-text="否"
            />
          </el-form-item>
        </el-form>
        <el-button
          v-if="input.id == null"
          type="primary"
          @click="addActivity()"
          >新增
        </el-button>
        <el-button
          v-if="input.id != null"
          type="primary"
          @click="updateActivity()"
          >更新
        </el-button>
        <el-button
          v-if="input.id != null"
          type="success"
          @click="clearInput()"
          >取消
        </el-button>
      </el-space>
      <el-skeleton
        style="width: 300px"
        :loading="timelineLoading"
        :rows="15"
        :throttle="100"
        animated
      >
        <template #default>
          <ElSteps
            direction="vertical"
            align-center
            space="12vh"
            class="mt-5 w-full !flex-wrap content-center"
          >
            <ElStep
              v-for="(activity, index) in activities"
              :key="index"
              :status="style(activity.start as Date, activity.end as Date)"
              class="tracking-[1.5px]"
            >
              <template #title>
                <div class="font-bold sm:text-lg">
                  {{ activity.content }}
                </div>
              </template>
              <template #description>
                <div class="min-w-max sm:text-base">
                  <span>{{
                    activity.start.toLocaleString(undefined, {
                      dateStyle: "long",
                      timeStyle: activity.showTime ? "medium" : undefined,
                    })
                  }}</span>
                  <span v-if="activity.showEnd"> 〜 </span>
                  <span v-if="activity.showEnd && !activity.showTime">{{
                    activity.end.toLocaleString(undefined, {
                      dateStyle: "long",
                      timeStyle: activity.showTime ? "medium" : undefined,
                    })
                  }}</span>
                </div>
                <div
                  v-if="activity.showEnd && activity.showTime"
                  class="min-w-max sm:text-base"
                >
                  {{
                    activity.end.toLocaleString(undefined, {
                      dateStyle: "long",
                      timeStyle: activity.showTime ? "medium" : undefined,
                    })
                  }}
                </div>
                <div>
                  <el-button
                    :icon="Edit"
                    @click="editActivity(activity.id)"
                  />
                  <el-button
                    :icon="Delete"
                    @click="deleteActivity(activity.id)"
                  />
                </div>
              </template>
            </ElStep>
          </ElSteps>
        </template>
      </el-skeleton>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance } from "element-plus";
import { Delete, Edit } from "@element-plus/icons-vue";

definePageMeta({
  middleware: ["admin"],
  title: "管理首頁時間線頁面",
});

const input = ref<Activity>({
  id: null,
  content: "",
  start: "",
  end: "",
  showEnd: false,
  showTime: false,
});
const formRef = ref<FormInstance>();

const deleteActivity = (id: number | null) => {
  if (id === null) {
    return;
  }
  $fetch("/api/timeline/del", {
    method: "DELETE",
    query: {
      id: id,
    },
  })
    .catch((e) => {
      console.error(e);
      ElMessage.error("刪除失敗");
    })
    .then(() => {
      ElMessage.success("刪除成功");
    })
    .finally(() => {
      refreshActivities();
    });
};

const editActivity = (id: number | null) => {
  if (id === null) {
    return;
  }
  const activity = activities.value!.find((activity) => activity.id === id);
  if (activity === undefined) {
    return;
  }
  //deep copy
  input.value = {
    id: activity.id,
    content: activity.content,
    start: activity.start,
    end: activity.end,
    showEnd: activity.showEnd,
    showTime: activity.showTime,
  };
  formRef.value?.scrollToField("content");
};

const updateActivity = () => {
  if (input.value.id === null) {
    ElMessage.error("未選擇更新目標");
    return;
  }
  if (checkActivity(input.value) === false) {
    return;
  }
  $fetch("/api/timeline/update", {
    method: "PUT",
    body: input.value,
  })
    .catch((e) => {
      console.error(e);
      ElMessage.error("更新失敗");
    })
    .then(() => {
      clearInput();
      ElMessage.success("更新成功");
    })
    .finally(() => {
      refreshActivities();
    });
};

const addActivity = () => {
  if (checkActivity(input.value) === false) {
    return;
  }
  $fetch("/api/timeline/add", {
    method: "PUT",
    body: input.value,
  })
    .catch((e) => {
      console.error(e);
      ElMessage.error("新增失敗");
    })
    .then(() => {
      clearInput();
      ElMessage.success("新增成功");
    })
    .finally(() => {
      refreshActivities();
    });
};

const checkActivity = (activity: Activity) => {
  if (activity.content === "") {
    ElMessage.error("內容不可為空");
    return false;
  }
  if (activity.start > activity.end) {
    ElMessage.error("開始時間不可大於結束時間");
    return false;
  }
  return true;
};

const clearInput = () => {
  input.value = {
    id: null,
    content: "",
    start: "",
    end: "",
    showEnd: false,
    showTime: false,
  };
};

const style = (start: Date, end: Date) => {
  return Date.now() < start.getTime()
    ? "process"
    : Date.now() < end.getTime()
      ? "finish"
      : "success";
};

const {
  data: activities,
  refresh: refreshActivities,
  pending: timelineLoading,
} = useFetch("/api/timeline/get", {
  method: "GET",
  transform: (activities_origin) =>
    activities_origin.map((activity: Activity) => {
      activity.start = new Date(activity.start);
      activity.end = new Date(activity.end);
      return activity;
    }),
});

interface Activity {
  id: number | null;
  content: string;
  start: Date | string;
  end: Date | string;
  showEnd: boolean;
  showTime: boolean;
}
</script>
