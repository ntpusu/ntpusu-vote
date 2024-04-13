<template>
  <div class="flex h-[70vh]">
    <ElCard class="m-auto w-full sm:w-5/6 md:w-3/4 lg:w-1/2 xl:w-1/3">
      <template #header>
        <ElPageHeader
          title="回首頁"
          content="登入"
          class="font-bold"
          @back="useRouter().push('/')"
        />
      </template>
      <div class="flex w-full flex-col">
        <NuxtImg
          src="/login/google.png"
          format="png"
          preload
          class="m-auto my-2 w-64 cursor-pointer sm:w-72"
          @click="signIn('google', { callbackUrl: '/vote' })"
        />
        <NuxtImg
          src="/login/microsoft.svg"
          format="svg"
          preload
          class="m-auto my-2 w-64 cursor-pointer sm:w-72"
          @click="signIn('azure-ad', { callbackUrl: '/vote' })"
        />
        <span class="m-auto pt-5 text-sm text-gray-600">
          請使用學校 Google 或 Microsoft 帳號進行登錄
        </span>
        <span class="m-auto text-xs text-gray-600">
          (s+學號@gm.ntpu.edu.tw 或 s+學號@ms.ntpu.edu.tw)
        </span>
      </div>
    </ElCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: "/",
  },
  title: "登入",
});

const { signIn } = useAuth();
</script>
