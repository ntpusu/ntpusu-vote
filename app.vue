<template>
  <ElContainer
    direction="vertical"
    class="h-[100dvh] font-sansTC"
  >
    <NuxtLoadingIndicator />
    <ClientOnly>
      <template #fallback>
        <div class="flex h-14 items-center justify-center">
          <span class="margin text-gray-400"> Loading menu...... </span>
        </div>
        <ElDivider class="!m-0" />
      </template>
      <ElMenu
        :default-active="useRoute().path"
        unique-opened
        mode="horizontal"
        :ellipsis="false"
        :active-index="curIndex"
        :popper-offset="4"
        class="items-center"
        @select="handleSelect"
      >
        <span
          class="m-auto ml-3 cursor-pointer text-2xl font-bold md:ml-5 md:text-3xl"
          @click="useRouter().push('/')"
        >
          選舉委員會
        </span>
        <div class="flex-grow" />
        <!-- > md -->
        <ElMenuItem
          v-for="(item, index) in getMenuItems()"
          :key="index"
          :index="item.index"
          class="!hidden md:!inline-flex"
          @click="item.click"
        >
          <span class="text-sm font-bold sm:text-base md:text-lg">{{
            item.text
          }}</span>
        </ElMenuItem>
        <ElSubMenu
          v-if="admin"
          class="!hidden h-full md:!inline-flex"
          index="/admin"
        >
          <template #title>
            <span class="text-sm font-bold sm:text-base md:text-lg">
              管理
            </span>
          </template>
          <ElMenuItem
            v-for="(item, index) in getAdminMenuItems()"
            :key="index"
            :index="item.index"
            class="!hidden md:!block"
            @click="item.click"
          >
            <span class="text-sm font-bold sm:text-base md:text-lg">{{
              item.text
            }}</span>
          </ElMenuItem>
        </ElSubMenu>
        <ElMenuItem
          v-if="status === 'unauthenticated'"
          index="/login"
          class="!hidden md:!inline-flex"
          @click="useRouter().push('/login')"
        >
          <span class="text-sm font-bold sm:text-base md:text-lg"> 登入 </span>
        </ElMenuItem>
        <ElMenuItem
          v-if="status === 'authenticated'"
          index="/logout"
          class="!hidden md:!inline-flex"
          @click="signOut({ callbackUrl: '/' })"
        >
          <span class="text-sm font-bold sm:text-base md:text-lg"> 登出 </span>
        </ElMenuItem>
        <!-- < md -->
        <ClientOnly v-if="showLoginBadge">
          <ElTooltip
            effect="dark"
            content="你的登入序號"
            placement="bottom"
          >
            <ElButton
              class="cursor-pointer md:!hidden"
              type="primary"
              size="large"
              circle
              @click="showLoginInfo"
            >
              <span class="text-sm font-bold text-white sm:text-base">{{
                loginInfo.id
              }}</span>
            </ElButton>
          </ElTooltip>
        </ClientOnly>
        <ClientOnly>
          <ElTooltip
            effect="dark"
            content="累計已登入人數"
            placement="bottom"
          >
            <ElButton
              class="cursor-pointer md:!hidden"
              type="success"
              size="large"
              circle
              @click="showTotalBadge = true"
            >
              <span class="text-sm font-bold text-white sm:text-base">{{
                totalCnt
              }}</span>
            </ElButton>
          </ElTooltip>
        </ClientOnly>
        <ElButton
          link
          class="!ml-4 mr-6 md:!hidden"
          @click="show = !show"
        >
          <template #default>
            <ElIcon size="25">
              <More v-if="!show" />
              <MoreFilled v-else
            /></ElIcon>
          </template>
        </ElButton>
      </ElMenu>
    </ClientOnly>

    <div class="md:hidden">
      <div
        v-if="show"
        class="fixed bottom-0 left-0 right-0 top-[3.3rem] z-40 bg-gray-500 bg-opacity-40"
        @click="show = !show"
      />
      <Transition name="menu">
        <div
          v-show="show"
          class="absolute bottom-0 right-0 top-[3.4rem] z-50 w-40"
        >
          <ClientOnly>
            <ElMenu
              :default-active="useRoute().path"
              text-color="#808080"
              active-text-color="#3E84F6"
              :active-index="curIndex"
              @select="handleSelect"
            >
              <ElMenuItem
                v-if="status === 'unauthenticated'"
                index="/login"
                @click="
                  show = !show;
                  useRouter().push('/login');
                "
              >
                <span class="text-sm font-bold sm:text-base md:text-lg">
                  登入
                </span>
              </ElMenuItem>
              <ElMenuItem
                v-for="(item, index) in getMenuItems()"
                :key="index"
                :index="item.index"
                @click="item.click"
              >
                <span class="text-sm font-bold sm:text-base md:text-lg">{{
                  item.text
                }}</span>
              </ElMenuItem>
              <ElSubMenu
                v-if="admin"
                index="/totalAdmin"
              >
                <template #title>
                  <span class="text-sm font-bold sm:text-base md:text-lg"
                    >管理</span
                  >
                </template>
                <ElMenuItem
                  v-for="(item, index) in getAdminMenuItems()"
                  :key="index"
                  :index="item.index"
                  @click="item.click"
                >
                  <span class="text-sm font-bold sm:text-base md:text-lg">{{
                    item.text
                  }}</span>
                </ElMenuItem>
              </ElSubMenu>
              <ElMenuItem
                v-if="status === 'authenticated'"
                index="/logout"
                @click="signOut({ callbackUrl: '/' })"
              >
                <span class="text-sm font-bold sm:text-base md:text-lg">
                  登出
                </span>
              </ElMenuItem>
            </ElMenu>
          </ClientOnly>
        </div>
      </Transition>
    </div>
    <ElAffix
      class="absolute right-10 top-[5.5rem] z-10 hidden hover:animate-pulse md:block"
    >
      <ClientOnly>
        <ElTooltip
          effect="dark"
          content="累計已登入人數"
          placement="left"
        >
          <ElButton
            class="!h-14 !w-14 cursor-pointer"
            type="success"
            size="large"
            circle
            @click="showTotalBadge = true"
          >
            <span class="text-sm font-bold text-white sm:text-base">{{
              totalCnt
            }}</span></ElButton
          >
        </ElTooltip>
      </ClientOnly>
    </ElAffix>
    <ElAffix
      v-if="showLoginBadge"
      class="absolute right-10 top-[9.5rem] z-10 hidden hover:animate-pulse md:block"
    >
      <ClientOnly>
        <ElTooltip
          effect="dark"
          content="你的登入序號"
          placement="left"
        >
          <ElButton
            class="!h-14 !w-14 cursor-pointer"
            type="primary"
            circle
            @click="showLoginInfo"
          >
            <span class="text-sm font-bold text-white sm:text-base">{{
              loginInfo.id
            }}</span>
          </ElButton>
        </ElTooltip>
      </ClientOnly>
    </ElAffix>
    <ClientOnly>
      <ElDialog
        v-model="showTotalBadge"
        align-center
        :show-close="false"
        width="30%"
        class="-py-4 min-w-fit !rounded-lg"
        @click="showTotalBadge = false"
      >
        <div
          class="-mt-7 flex flex-col items-center justify-center md:flex-row"
        >
          <ElTooltip
            effect="dark"
            placement="top"
          >
            <template #content>
              <div class="text-center">投票開始時會重置一次</div>
            </template>
            <div class="m-3 text-center">
              <div class="text-lg text-black">累計已登入人數</div>
              <div class="text-2xl font-bold text-black">{{ totalCnt }} 人</div>
            </div>
          </ElTooltip>
          <ElDivider
            direction="vertical"
            border-style="dashed"
            class="!hidden !h-16 !border-l-2 md:!inline-block"
          />
          <ElDivider
            border-style="dashed"
            class="!m-0 !border-t-2 md:!hidden"
          />
          <ElTooltip
            effect="dark"
            placement="top"
          >
            <template #content>
              <div class="text-center">
                投票期間為<br>2024年5月23日<br>00:00 ~ 23:59
              </div>
            </template>
            <div class="m-3 text-center">
              <div class="text-lg text-black">投票期間登入人數</div>
              <div class="text-2xl font-bold text-black">{{ realCnt }} 人</div>
            </div>
          </ElTooltip>
        </div>
      </ElDialog>
    </ClientOnly>
    <ElScrollbar :always="true">
      <noscript>
        您的瀏覽器尚未啟用
        JavaScript，因此無法開啟檔案。請於啟用後重新載入頁面。
      </noscript>
      <div class="m-2 sm:m-3 md:m-4">
        <NuxtPage keepalive />
      </div>
    </ElScrollbar>
    <ElDivider class="!m-0" />
    <div
      class="z-10 flex h-6 items-center justify-between bg-white px-2 sm:h-7 sm:px-3 md:h-8 md:px-4"
    >
      <span
        class="text-center text-xs font-bold tracking-tighter text-stone-700 sm:text-sm sm:tracking-tight md:text-base md:tracking-normal"
      >
        <span class="max-[400px]:hidden">
          Made by
          <NuxtLink
            to="https://github.com/ntpusu/ntpusu-vote/graphs/contributors"
            class="font-bold hover:text-stone-600 hover:underline"
            target="_blank"
            >contributors</NuxtLink
          >
          |
        </span>
        <NuxtLink
          to="https://github.com/ntpusu/ntpusu-vote"
          class="font-bold hover:text-stone-600 hover:underline"
          target="_blank"
          >Open Source</NuxtLink
        >
      </span>
      <span
        class="text-center text-xs font-bold tracking-tighter text-stone-700 sm:text-sm sm:tracking-tight md:text-base md:tracking-normal"
      >
        ©
        {{ new Date().getFullYear() }}
        <NuxtLink
          to="https://www.facebook.com/NTPUSU"
          class="font-bold hover:text-stone-600 hover:underline"
          target="_blank"
          >國立臺北大學三峽校區學生會</NuxtLink
        >
      </span>
    </div>
    <ElCard
      v-if="!cookie"
      class="fixed bottom-0 z-30 w-full !rounded-b-none !rounded-t-3xl"
    >
      <template #header>
        <div class="-my-1 mx-2 flex justify-between sm:mx-4 md:mx-6">
          <div class="flex items-center text-base font-bold md:text-lg">
            Cookie 使用聲明
          </div>
          <ElButton
            type="warning"
            @click="cookie = '1'"
          >
            <span class="font-bold">了 解</span>
          </ElButton>
        </div>
      </template>
      <div class="flex justify-center">
        <span
          class="w-11/12 whitespace-pre-wrap break-words text-xs sm:text-sm md:text-base"
          >國立臺北大學三峽校區學生會投票網站（下稱「投票網站」）使用 Cookie
          來記錄您的登入狀態及增進您的使用體驗。這些 Cookie
          僅限於投票網站使用，不會將 Cookie 用於其他目的。如果您選擇禁用
          Cookie，將會無法使用投票網站的部分功能。繼續使用投票網站即表示你同意我們使用
          Cookie。若您對此使用聲明有任何疑問，請隨時<NuxtLink
            to="https://www.facebook.com/NTPUSU"
            target="_blank"
            class="whitespace-pre-wrap break-all font-bold text-blue-400 hover:text-blue-500 hover:underline"
            >聯繫我們</NuxtLink
          >。</span
        >
      </div>
    </ElCard>
  </ElContainer>
  <SpeedInsights />
</template>

<script setup lang="ts">
import { SpeedInsights } from "@vercel/speed-insights/vue";
import { More, MoreFilled } from "@element-plus/icons-vue";

const route = useRoute();
const url = useRuntimeConfig().public.productionUrl as string;

useSeoMeta({
  title: "學生會投票網站",
  titleTemplate() {
    return `${route.meta.title} | 學生會投票網站`;
  },
  description: "國立臺北大學三峽校區學生會投票網站",
  ogTitle: "國立臺北大學三峽校區學生會投票網站",
  ogDescription() {
    return `${route.meta.title} | 國立臺北大學三峽校區學生會投票網站`;
  },
  ogSiteName: "國立臺北大學三峽校區學生會投票網站",
  ogType: "website",
  ogUrl: url,
  ogImage: url + "/ntpusu.jpg",
  ogImageAlt: "國立臺北大學三峽校區學生會的標誌",
  ogImageType: "image/jpeg",
  ogImageSecureUrl: url,
  ogLocale: "zh_TW",
  ogLocaleAlternate: "zh_TW",
  author: "國立臺北大學三峽校區學生會",
  creator: "國立臺北大學三峽校區學生會",
  publisher: "國立臺北大學三峽校區學生會",
  twitterTitle: "國立臺北大學三峽校區學生會投票網站",
  twitterDescription() {
    return `${route.meta.title} | 國立臺北大學三峽校區學生會投票網站`;
  },
  twitterImage: url + "/ntpusu.jpg",
  twitterImageAlt: "國立臺北大學三峽校區學生會的標誌",
  twitterCard: "summary",
});

useHead({
  htmlAttrs: {
    lang: "zh_TW",
  },
  meta: [
    {
      name: "copyright",
      content: "國立臺北大學三峽校區學生會",
    },
  ],
  link: [
    {
      rel: "icon",
      type: "image/jpeg",
      href: "/ntpusu.jpg",
    },
    {
      rel: "favicon icon",
      type: "image/x-icon",
      href: "/favicon.ico",
    },
  ],
  script: [
    {
      src: "https://www.instagram.com/embed.js",
      tagPosition: "bodyClose",
    },
  ],
});

const curIndex = ref(useRoute().path);

const { data: admin } = await useFetch("/api/check/admin");
const { data: superAdmin } = await useFetch("/api/check/superAdmin");

const { status, signOut } = useAuth();

const show = ref(false);

const handleSelect = (key: string) => {
  curIndex.value = key;
};

const getMenuItems = () => {
  const menuItems = [
    {
      index: "/",
      text: "首頁",
      click: () => {
        show.value = false;
        useRouter().push("/");
      },
    },
    {
      index: "/bulletin",
      text: "選舉資訊",
      click: () => {
        show.value = false;
        useRouter().push("/bulletin");
      },
    },
  ];
  if (status.value === "authenticated") {
    menuItems.push({
      index: "/vote",
      text: "投票",
      click: () => {
        show.value = false;
        useRouter().push("/vote");
      },
    });
  }
  return menuItems;
};

const getAdminMenuItems = () => {
  if (admin.value) {
    const menuItems = [
      {
        index: "/admin/editVoting",
        text: "管理投票",
        click: () => {
          show.value = false;
          useRouter().push("/admin/editVoting");
        },
      },
      {
        index: "/admin/search",
        text: "查詢",
        click: () => {
          show.value = false;
          useRouter().push("/admin/search");
        },
      },
      {
        index: "/admin/editVoter",
        text: "管理投票者",
        click: () => {
          show.value = false;
          useRouter().push("/admin/editVoter");
        },
      },
      {
        index: "/admin/editDepartment",
        text: "管理選舉區",
        click: () => {
          show.value = false;
          useRouter().push("/admin/editDepartment");
        },
      },
    ];

    if (superAdmin.value) {
      menuItems.push({
        index: "/admin/editAdmin",
        text: "管理管理員",
        click: () => {
          show.value = false;
          useRouter().push("/admin/editAdmin");
        },
      });
    }

    return menuItems;
  }

  return [];
};

const cookie = useCookie("cookie", {
  sameSite: "lax",
  secure: true,
});

const loginInfo = ref({
  id: 0,
  time: "",
});

const showLoginInfo = async () => {
  await ElMessageBox.alert(
    "之後會用此序號抽出得獎者",
    "你是第 " + loginInfo.value.id + " 個登入投票網站的人",
    {
      confirmButtonText: "確 定",
      showClose: false,
      lockScroll: true,
      autofocus: false,
      closeOnClickModal: true,
      closeOnPressEscape: true,
      type: "success",
      roundButton: true,
      customStyle: {
        fontFamily: '"Noto Sans TC", sans-serif',
      },
    },
  ).catch(() => {});
};

const showLoginBadge = ref(false);
const showTotalBadge = ref(false);

const checkLogin = () => {
  setTimeout(async () => {
    if (status.value) {
      if (status.value === "authenticated") {
        await $fetch("/api/check/login").then(async (res) => {
          loginInfo.value = res.login;
          showLoginBadge.value = true;

          if (res.firstLogin) {
            await totalCntRefresh();
            await realCntRefresh();
            await showLoginInfo();
          }
        });
      }
    } else checkLogin();
  }, 250);
};

const { data: totalCnt, refresh: totalCntRefresh } = await useFetch("/api/loginCnt/get");
const { data: realCnt, refresh: realCntRefresh } = await useFetch("/api/loginCnt/get", {
  params: {
    startTime: new Date(2024, 4, 23).getTime(),
    endTime: new Date(2024, 4, 23, 23, 59, 59, 999).getTime(),
  },
});

onMounted(() => {
  checkLogin();
});
</script>

<style>
.page-enter-active,
.page-leave-active {
  @apply transition-all duration-200;
}

.page-enter-from,
.page-leave-to {
  @apply opacity-0 blur;
}

.menu-leave-active,
.menu-enter-active {
  @apply transition-transform duration-300;
}

.menu-enter-from,
.menu-leave-to {
  @apply translate-x-full;
}
</style>
