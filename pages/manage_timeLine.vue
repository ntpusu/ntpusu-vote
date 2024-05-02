<template>
  <div class="flex flex-wrap justify-center">
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
      <el-form-item>
        <el-button
          type="primary"
          @click="addActivity"
          >新增</el-button
        >
      </el-form-item>
    </el-form>
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
        </template>
      </ElStep>
    </ElSteps>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { FormInstance } from "element-plus";

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

const addActivity = async () => {
  if (
    contentInput.value === "" ||
    startTimePicker.value === "" ||
    endTimePicker.value === ""
  ) {
    ElMessage.error("請輸入完整資訊");
    return;
  }
  const { error } = await useFetch("/api/addTimeLine", {
    method: "POST",
    body: {
      content: contentInput.value,
      start: startTimePicker.value,
      end: endTimePicker.value,
      showEnd: showEnd.value,
      showTime: showTime.value,
    },
  });
  if (error.value) {
    ElMessage.error("新增失敗");
  } else {
    ElMessage.success("新增成功");
    contentInput.value = "";
    startTimePicker.value = "";
    endTimePicker.value = "";
    await parseActivities();
  }
};

const style = (start: Date, end: Date) => {
  return Date.now() < start.getTime()
    ? "process"
    : Date.now() < end.getTime()
      ? "finish"
      : "success";
};

const activities: Activity[] = [];

const parseActivities = async () => {
  const { data: activities_origin } = await useFetch("/api/getTimeLine", {
    method: "GET",
  });

  if (activities_origin.value == null) {
    return;
  }
  for (const activity of activities_origin.value) {
    activities.push({
      content: activity.content,
      start: new Date(activity.start),
      end: new Date(activity.end),
      showEnd: activity.showEnd,
      showTime: activity.showTime,
    });
  }
};

await parseActivities();

interface Activity {
  content: string;
  start: Date;
  end: Date;
  showEnd: boolean;
  showTime: boolean;
}
</script>
