<template>
  <ElResult
    icon="error"
    title="404 NOT FOUND🧐"
    class="mt-16"
  >
    <template #extra>
      <NuxtLink
        to="/"
        class="grid text-center"
      >
        <ElText type="danger">
          {{ countdown.toFixed(1) }} 秒後自動跳轉至首頁
        </ElText>
      </NuxtLink>
    </template>
  </ElResult>
</template>

<script setup lang="ts">
definePageMeta({
  title: "404 NOT FOUND",
  layout: "error",
  auth: false,
});

const event = useRequestEvent();
if (event) setResponseStatus(event, 404, "NOT FOUND");

const countdown = ref(10);
const timer = () => {
  setTimeout(async () => {
    countdown.value -= 0.1;

    if (countdown.value > 0.1) timer();
    else if (useRoute().path == "/404") await useRouter().push("/");
  }, 100);
};

onActivated(() => {
  if (useRoute().path != "/404") {
    setTimeout(async () => {
      await useRouter().push("/404");
    }, 250);
  } else timer();
});
</script>
