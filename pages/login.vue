<template>
  <div class="flex h-[70dvh]">
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
          class="m-auto my-2 w-64 sm:w-72"
          :class="
            isInAppBrowser ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          "
          @click="
            isInAppBrowser
              ? googleLoginInEmbedded()
              : signIn('google', { callbackUrl: '/vote' })
          "
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
        <br>
        <span class="m-auto text-xs text-gray-600">
          <NuxtLink
            to="/privacy"
            class="font-bold hover:text-stone-600 hover:underline"
            >Privacy Policy
          </NuxtLink>
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
const isInAppBrowser = ref(false);

const googleLoginInEmbedded = () => {
  ElMessageBox.alert(
    "Google 登入無法在內嵌瀏覽器中使用",
    "請使用其他瀏覽器開啟",
    {
      confirmButtonText: "確定",
      type: "warning",
      roundButton: true,
    },
  );
};

const isWebview = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
  const rules = [
    "WebView",
    "(iPhone|iPod|iPad)(.*Line|(?!.*Safari))",
    "Android.*(;\\s+wv|Version/\\d.\\d\\s+Chrome/\\d+(\\.0){3})",
    "Linux; U; Android",
  ];
  const regex = new RegExp(`(${rules.join("|")})`, "ig");
  return Boolean(ua.match(regex));
};

onMounted(() => {
  isInAppBrowser.value = isWebview();
});
</script>
