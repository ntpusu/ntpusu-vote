<template>
  <div class="flex flex-wrap justify-center">
    <el-space direction="vertical">
      <el-form
        ref="formRef"
        label-width="auto"
        label-suffix=":"
        hide-required-asterisk
      >
        <el-form-item label="設定時間軸">
          <el-input
            v-model="contentInput"
            placeholder="設定內容"
          />
        </el-form-item>
        <el-form-item label="開始時間">
          <el-date-picker
            v-model="startTimePicker"
            type="datetime"
            placeholder="選擇開始時間"
          />
        </el-form-item>
        <el-form-item label="結束時間">
          <el-date-picker
            v-model="endTimePicker"
            type="datetime"
            placeholder="選擇結束時間"
          />
        </el-form-item>
        <el-form-item label="是否顯示詳細時間">
          <el-switch
            v-model="showTime"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
        <el-form-item label="是否顯示結束時間">
          <el-switch
            v-model="showEnd"
            inline-prompt
            active-text="是"
            inactive-text="否"
          />
        </el-form-item>
      </el-form>
      <el-button
        v-if="editActivityId == null"
        type="primary"
        @click="addActivity()"
        >新增
      </el-button>
      <el-button
        v-if="editActivityId != null"
        type="primary"
        @click="updateActivity(editActivityId)"
        >更新
      </el-button>
      <el-button
        v-if="editActivityId != null"
        type="success"
        @click="clearInput()"
        >取消
      </el-button>
      <el-skeleton style="width: 300px" :loading="timelineLoading" :rows="15" :throttle="100" animated>
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
              :status="style(activity.start, activity.end)"
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
                <el-button  :icon="Edit" @click="editActivity(activity.id)" />
                <el-button  :icon="Delete" @click="deleteActivity(activity.id)" />
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
import { ref } from "vue";
import type { FormInstance } from "element-plus";
import { Delete, Edit } from '@element-plus/icons-vue'

definePageMeta({
  middleware: ["admin"],
  title: "管理首頁時間線頁面",
});

const contentInput = ref("");
const startTimePicker = ref("");
const endTimePicker = ref("");
const showEnd = ref(false);
const showTime = ref(false);
const formRef = ref<FormInstance>();
const editActivityId: Ref<number | null> = ref(null);

const deleteActivity = async (id: number) => {
  $fetch("/api/timeline/del", {
    method: "DELETE",
    query: {
      id: id,
    },
  }).catch((e) => {
    console.error(e);
    ElMessage.error("刪除失敗");
  }).then(() => {
    ElMessage.success("刪除成功");
  }).finally(() => {
    refreshActivities()
  })
}

const editActivity = async (id: number) => {
  const activity = activities.value.find((activity) => activity.id === id);
  if (activity === undefined) {
    return;
  }
  contentInput.value = activity.content;
  startTimePicker.value = activity.start.toString();
  endTimePicker.value = activity.end.toString();
  showEnd.value = activity.showEnd;
  showTime.value = activity.showTime;
  editActivityId.value = id;
}

const updateActivity = async (id: number) => {
  if (
    contentInput.value === "" ||
    startTimePicker.value === "" ||
    endTimePicker.value === ""
  ) {
    ElMessage.error("請輸入完整資訊");
    return;
  }
  $fetch("/api/timeline/update", {
    method: "PUT",
    body: {
      id: id,
      content: contentInput.value,
      start: startTimePicker.value,
      end: endTimePicker.value,
      showEnd: showEnd.value,
      showTime: showTime.value,
    },
  }).catch((e) => {
    console.error(e);
    ElMessage.error("更新失敗");
  }).then(() => {
    clearInput();
    ElMessage.success("更新成功");
  }).finally(() => {
    refreshActivities();
  })
};

const addActivity = async () => {
  if (
    contentInput.value === "" ||
    startTimePicker.value === "" ||
    endTimePicker.value === ""
  ) {
    ElMessage.error("請輸入完整資訊");
    return;
  }
  $fetch("/api/timeline/add", {
    method: "PUT",
    body: {
      content: contentInput.value,
      start: startTimePicker.value,
      end: endTimePicker.value,
      showEnd: showEnd.value,
      showTime: showTime.value,
    },
  }).catch((e) => {
    console.error(e);
    ElMessage.error("新增失敗");
  }).then(() => {
    clearInput();
    ElMessage.success("新增成功");
  }).finally(() => {
    refreshActivities();
  })
};

const clearInput = () => {
  contentInput.value = "";
  startTimePicker.value = "";
  endTimePicker.value = "";
  showEnd.value = false;
  showTime.value = false;
  editActivityId.value = null;
};

const style = (start: Date, end: Date) => {
  return Date.now() < start.getTime()
    ? "process"
    : Date.now() < end.getTime()
      ? "finish"
      : "success";
};

const timelineLoading = ref(false);

const activities = ref<Activity[]>([]);

const refreshActivities = async () => {
  timelineLoading.value = true;
  useFetch("/api/timeline/get", {
    method: "GET",
  }).then((activities_origin) => {
    activities.value = [];
    if (activities_origin.data.value == null) {
      return;
    }
    for (const activity of activities_origin.data.value) {
      activities.value.push({
        id: activity.id,
        content: activity.content,
        start: new Date(activity.start),
        end: new Date(activity.end),
        showEnd: activity.showEnd,
        showTime: activity.showTime,
      });
    }
  }).finally(() => {
    timelineLoading.value = false;
  })
};

refreshActivities();

interface Activity {
  id: number;
  content: string;
  start: Date;
  end: Date;
  showEnd: boolean;
  showTime: boolean;
}
</script>
