<template>
  <div class="flex flex-wrap justify-center">
    <div>
      <el-text class="mx-1">設定時間軸</el-text>
      <el-input v-model="contentInput" style="width: 240px" placeholder="設定內容" />
      <el-date-picker
        v-model="startTimePicker"
        type="datetime"
        placeholder="Select date and time"
      />
      <el-date-picker
        v-model="FinishTimePicker"
        type="datetime"
        placeholder="Select date and time"
      />
    </div>
    <ElSteps
      direction="vertical"
      align-center
      space="12vh"
      class="mt-5 w-full !flex-wrap content-center"
    >
      <ElStep
        v-for="(activity, index) in activities"
        :key="index"
        :status="style(activity.start, activity.finish)"
        class="tracking-[1.5px]"
      >
        <template #title>
          <div class="font-bold sm:text-lg">
            {{ activity.content }}
          </div>
        </template>
        <template #description>
          <div class="min-w-max sm:text-base">
            {{
              activity.start.toLocaleString(undefined, {
                dateStyle: "long",
              }) +
              (activity.end
                ? "〜" +
                  activity.end.toLocaleString(undefined, {
                    dateStyle: "long",
                  })
                : "")
            }}
            {{ activity.maybe ? "(預定)" : "" }}
          </div>
        </template>
      </ElStep>
    </ElSteps>
  </div>
</template>

<script setup lang="ts">

definePageMeta({
  middleware: ["admin"],
  title: "管理首頁時間線頁面",
});

const { data:activities } = await useFetch("/api/getTimeLine", {
      method: "GET",
    });

</script>