<template>
  <div>
    <ElSkeleton
      animated
      :loading="votingPending || data === null"
      class="flex flex-col items-center"
    >
      <template #template>
        <ElSkeletonItem
          variant="rect"
          class="mb-3 !h-8 !w-1/3 !min-w-[360px] !rounded-sm"
        />
        <ElSpace
          alignment="center"
          wrap
          class="justify-center"
        >
          <ElSkeletonItem
            v-for="key in rand(1, 4)"
            :key="key"
            variant="rect"
            class="!w-[85vw] !rounded-xl sm:!w-[65vw] md:!w-[50vw] lg:!w-[40vw] xl:!w-[35vw] 2xl:!w-[28vw]"
            :style="{ height: rand(15, 25) + 'rem' }"
          />
        </ElSpace>
      </template>
      <template #default>
        <div
          v-if="!votingPending && data !== null"
          class="flex flex-col items-center"
        >
          <ElAlert
            show-icon
            center
            class="!mb-2.5 !w-1/3 !min-w-fit"
          >
            <template #title>
              <div class="mr-3 items-center text-gray-600">
                若要查看照片或政見等資訊，可以至<NuxtLink
                  to="/bulletin"
                  class="whitespace-pre-wrap break-all font-bold text-blue-400 hover:text-blue-500 hover:underline"
                  >選舉資訊</NuxtLink
                >查看
              </div>
            </template>
          </ElAlert>
          <ElSpace
            v-if="data.voting.length"
            alignment="center"
            wrap
            class="justify-center"
          >
            <ElCard
              v-for="votingItem in data.voting"
              :key="votingItem.id"
              shadow="hover"
              class="w-[85vw] !rounded-xl sm:w-[65vw] md:w-[50vw] lg:w-[40vw] xl:w-[35vw] 2xl:w-[28vw]"
            >
              <template #header>
                <div class="flex items-center justify-between">
                  <div
                    class="cursor-default text-lg font-bold sm:text-xl md:text-2xl"
                  >
                    {{ votingItem.name }}
                  </div>
                  <div
                    class="flex flex-col justify-end align-middle text-xs sm:text-sm"
                  >
                    <ClientOnly>
                      <ElTooltip
                        placement="right"
                        :disabled="Date.now() > timeCnt(votingItem.endTime)"
                      >
                        <template #content>
                          <ElCountdown
                            v-if="Date.now() < timeCnt(votingItem.startTime)"
                            class="text-center"
                            :format="chooseFormat(votingItem.startTime)"
                            :value="timeCnt(votingItem.startTime)"
                            value-style="color: white;"
                            @finish="votingRefresh()"
                          >
                            <template #title>
                              <span class="!text-white"> 距離開始還有 </span>
                            </template>
                          </ElCountdown>
                          <span
                            v-else
                            class="m-auto"
                          >
                            已開始
                          </span>
                        </template>
                        <ElTag
                          round
                          effect="plain"
                          :class="{
                            'cursor-help':
                              Date.now() <= timeCnt(votingItem.endTime),
                            'cursor-default':
                              Date.now() > timeCnt(votingItem.endTime),
                          }"
                        >
                          開始:
                          {{ viewDate(votingItem.startTime) }}
                        </ElTag>
                      </ElTooltip>
                    </ClientOnly>
                    <div class="h-1 w-full" />
                    <ClientOnly>
                      <ElTooltip
                        placement="right"
                        :disabled="Date.now() < timeCnt(votingItem.startTime)"
                      >
                        <template #content>
                          <ElCountdown
                            v-if="Date.now() <= timeCnt(votingItem.endTime)"
                            class="text-center"
                            :format="chooseFormat(votingItem.endTime)"
                            :value="timeCnt(votingItem.endTime)"
                            value-style="color: white;"
                            @finish="votingRefresh()"
                          >
                            <template #title>
                              <span class="!text-white"> 距離結束還有 </span>
                            </template>
                          </ElCountdown>
                          <span
                            v-else
                            class="m-auto"
                          >
                            已結束
                          </span>
                        </template>
                        <ElTag
                          round
                          effect="plain"
                          :class="{
                            'cursor-help':
                              Date.now() >= timeCnt(votingItem.startTime),
                            'cursor-default':
                              Date.now() < timeCnt(votingItem.startTime),
                          }"
                        >
                          結束:
                          {{ viewDate(votingItem.endTime) }}
                        </ElTag>
                      </ElTooltip>
                    </ClientOnly>
                  </div>
                </div>
              </template>
              <div>
                <h2
                  class="cursor-default pb-5 text-center text-base font-bold sm:text-lg md:text-xl"
                >
                  候選人名單
                </h2>
                <ElSpace
                  class="!flex flex-col content-center justify-center"
                  wrap
                  alignment="flex-start"
                >
                  <div
                    v-if="votingItem.onlyOne"
                    class="flex items-center text-sm sm:text-base md:text-lg"
                  >
                    <ElTag
                      type="success"
                      effect="dark"
                      size="small"
                      round
                      class="cursor-default"
                    >
                      1
                    </ElTag>
                    <div class="text-b mx-2">
                      {{ votingItem.candidates[0].name }}
                    </div>
                  </div>
                  <template v-else>
                    <div
                      v-for="itemIndex in votingItem.candidates.length - 1"
                      :key="itemIndex"
                      class="flex items-center text-sm sm:text-base md:text-lg"
                    >
                      <ElTag
                        type="success"
                        effect="dark"
                        size="small"
                        round
                        class="cursor-default"
                      >
                        {{ itemIndex }}
                      </ElTag>
                      <div class="mx-2">
                        {{ votingItem.candidates[itemIndex - 1].name }}
                      </div>
                    </div>
                  </template>
                </ElSpace>
              </div>
              <ElDivider
                border-style="dotted"
                class="!border-t-2"
              />
              <div
                v-if="Date.now() < timeCnt(votingItem.startTime)"
                class="flex justify-center"
              >
                <ElButton
                  type="danger"
                  class="w-fit !rounded-md"
                  plain
                  loading
                >
                  <span class="font-bold"> 尚 未 開 始 </span>
                </ElButton>
              </div>
              <div v-else>
                <ClientOnly>
                  <ElDialog
                    v-model="voteVisible[votingItem.id]"
                    center
                    align-center
                    class="!w-fit min-w-[50%] max-w-[90%] !rounded-lg sm:max-w-[80%] md:min-w-[40%] md:max-w-[70%] lg:min-w-[30%] lg:max-w-[50%]"
                    @open="voteLoading[votingItem.id] = true"
                    @close="voteLoading[votingItem.id] = false"
                  >
                    <template #header>
                      <div class="flex h-12 *:px-2 md:h-14">
                        <div
                          class="m-auto flex cursor-default text-lg font-bold sm:text-xl md:text-2xl"
                        >
                          {{ votingItem.name }}
                        </div>
                        <div class="flex-grow" />
                        <div
                          class="m-auto flex cursor-default flex-col items-end text-xs text-gray-500 md:text-sm"
                        >
                          <span class="text-gray-500">
                            請在下方選擇您要投的選項
                          </span>
                          <span class="text-red-500">
                            投出選票後無法刪除或變更
                          </span>
                        </div>
                      </div>
                    </template>
                    <ElDivider class="!-mt-5 !mb-0 !border-t-[1.5px]" />
                    <div class="mx-5 flex flex-col items-center align-middle">
                      <span
                        v-if="votingItem.onlyOne"
                        class="my-2 cursor-default text-base font-bold text-black sm:my-3 sm:text-lg md:my-4 md:text-xl"
                      >
                        同意
                        {{ votingItem.candidates[0].name }}
                        當選嗎？
                      </span>
                      <span
                        v-else
                        class="my-2 cursor-default text-base font-bold text-black sm:my-3 sm:text-lg md:my-4 md:text-xl"
                      >
                        請選擇要投的候選人
                      </span>
                      <ElRadioGroup
                        v-model="voteData[votingItem.id]"
                        class="flex-col !items-stretch"
                      >
                        <ElRadio
                          v-for="candidate in votingItem.candidates.slice(
                            votingItem.onlyOne ? 1 : 0,
                          )"
                          :key="candidate.name"
                          :value="candidate.name"
                          border
                          size="large"
                          class="my-1 !mr-0 max-w-[75vw]"
                        >
                          <span
                            class="max-w-full cursor-default whitespace-pre-wrap break-all font-medium text-black"
                          >
                            {{ candidate.name }}
                          </span>
                        </ElRadio>
                      </ElRadioGroup>
                    </div>
                    <ElDivider
                      border-style="dashed"
                      class="!border-t-2"
                    />
                    <div class="flex flex-col items-center">
                      <span
                        class="-mt-2 mb-3 cursor-default text-sm text-gray-600"
                      >
                        目前登入的學號是：{{
                          authDate?.user?.email?.substring(1, 10)
                        }}
                      </span>
                      <RecaptchaV2
                        size="invisible"
                        @widget-id="handleWidgetId"
                        @error-callback="$router.go(0)"
                        @expired-callback="handleReset(widgetId)"
                        @load-callback="handleLoad"
                      />
                      <ElButton
                        type="primary"
                        class="w-fit !rounded-md"
                        plain
                        @click="
                          curVoteId = votingItem.id;
                          voteConfirm(votingItem.id);
                        "
                      >
                        <span class="font-bold"> 投 出 選 票 </span>
                      </ElButton>
                    </div>
                  </ElDialog>
                </ClientOnly>
                <div
                  v-if="Date.now() > timeCnt(votingItem.endTime)"
                  class="flex justify-center"
                >
                  <ElButton
                    type="success"
                    class="w-fit !rounded-md"
                    plain
                    :loading="resultLoading[votingItem.id]"
                    @click="seeResult(votingItem.id)"
                  >
                    <span class="font-bold"> 結 果 </span>
                  </ElButton>
                </div>
                <div
                  v-else
                  class="flex justify-center"
                >
                  <ElButton
                    type="primary"
                    class="w-fit !rounded-md"
                    :disabled="data.tokens[votingItem.id] != undefined"
                    plain
                    :loading="voteLoading[votingItem.id]"
                    @click="voteVisible[votingItem.id] = true"
                  >
                    <span
                      v-if="data.tokens[votingItem.id] == undefined"
                      class="font-bold"
                    >
                      投 票
                    </span>
                    <span
                      v-else
                      class="font-bold"
                    >
                      已 投 票
                    </span>
                  </ElButton>
                  <ElButton
                    type="info"
                    class="w-fit !rounded-md"
                    :disabled="data.tokens[votingItem.id] == undefined"
                    plain
                    :loading="tokenLoading[votingItem.id]"
                    @click="seeToken(votingItem.id)"
                  >
                    <span
                      v-if="data.tokens[votingItem.id] != undefined"
                      class="font-bold"
                    >
                      查 看 憑 證
                    </span>
                    <span
                      v-else
                      class="font-bold"
                    >
                      尚 未 投 票
                    </span>
                  </ElButton>
                </div>
              </div>
            </ElCard>
          </ElSpace>
          <ElResult
            v-else
            title="沒有投票"
            icon="info"
            class="mt-16"
          >
            <template #sub-title>
              若有疑問請隨時<NuxtLink
                to="https://www.facebook.com/NTPUSU"
                target="_blank"
                class="whitespace-pre-wrap break-all font-bold text-blue-500 hover:text-blue-800 hover:underline"
                >聯繫我們</NuxtLink
              >
            </template>
          </ElResult>
        </div>
      </template>
    </ElSkeleton>
    <ClientOnly>
      <ElDialog
        v-model="voteFail"
        align-center
        class="!w-fit min-w-[30%] max-w-[90%] !rounded-lg sm:max-w-[80%] md:max-w-[70%] lg:max-w-[50%]"
      >
        <template #header>
          <div class="text-2xl font-bold text-red-500">投票失敗</div>
        </template>
        <div class="px-5 pb-3 text-lg">
          可能原因：<br>
          1. 未登入<br>
          2. 網路連線斷了<br>
          3. 未在投票時間內投票<br>
          4. 操作過於頻繁<br>
          若有疑問請聯繫<NuxtLink
            to="https://www.facebook.com/NTPUSU"
            target="_blank"
            class="whitespace-pre-wrap break-all font-bold text-blue-400 hover:text-blue-500 hover:underline"
            >學生會</NuxtLink
          >
        </div>
      </ElDialog>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { rand } from "@vueuse/shared";
import type { Action } from "element-plus";
import { RecaptchaV2, useRecaptcha } from "vue3-recaptcha-v2";

definePageMeta({
  title: "投票",
});

const { data: authDate } = useAuth();

const {
  data,
  pending: votingPending,
  refresh: votingRefresh,
} = await useLazyFetch("/api/vote/voterSession");

const freshTime = ref(Date.now());

const viewDate = (time: string | number | Date) => {
  return new Date(time).toLocaleString(undefined, {
    hourCycle: "h11",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "numeric",
  });
};

const timeCnt = (time: string | number | Date) => {
  return new Date(time).getTime();
};

const chooseFormat = (time: string | number | Date) => {
  if (timeCnt(time) - Date.now() >= 24 * 60 * 60 * 1000)
    return "D 天 H 小時 m 分 s 秒";
  else if (timeCnt(time) - Date.now() >= 60 * 60 * 1000)
    return "H 小時 m 分 s 秒";
  else if (timeCnt(time) - Date.now() >= 60 * 1000) return "m 分 s 秒";
  else return "s 秒";
};

const curVoteId = ref(0);
const voteFail = ref(false);

const voteVisible: Ref<boolean[]> = ref([]);
const voteData: Ref<string[]> = ref([]);
const voteLoading: Ref<boolean[]> = ref([]);
const tokenLoading: Ref<boolean[]> = ref([]);
const resultLoading: Ref<boolean[]> = ref([]);

const { handleExecute, handleReset } = useRecaptcha();

const widgetId = ref(0);
const handleWidgetId = (id: number) => {
  widgetId.value = id;
};

const handleLoad = async (response: unknown) => {
  const res: {
    success: boolean;
  } = await $fetch("/api/recaptchaV2", {
    method: "POST",
    body: JSON.stringify({ response }),
  });

  if (res.success) {
    vote(curVoteId.value);
  } else {
    handleReset(widgetId.value);
    setTimeout(() => {
      handleExecute(widgetId.value);
    }, 200);
  }
};

const voteConfirm = async (votingId: number) => {
  if (!voteData.value[votingId]) {
    ElMessage({
      type: "warning",
      message: "請選擇候選人",
    });
    return;
  }

  voteVisible.value[votingId] = false;
  setTimeout(() => {
    voteLoading.value[votingId] = true;
  }, 10);

  await ElMessageBox.confirm(
    "投出選票後無法刪除或變更",
    "確定要投給「" + voteData.value[votingId] + "」嗎？",
    {
      confirmButtonText: "確 定",
      cancelButtonText: "取 消",
      autofocus: false,
      type: "warning",
      customStyle: {
        fontFamily: '"Noto Sans TC", sans-serif',
      },
    },
  )
    .then(async () => {
      handleExecute(widgetId.value);
    })
    .catch(() => {
      voteVisible.value[votingId] = true;
      handleReset(widgetId.value);
    });

  voteLoading.value[votingId] = false;
};

const vote = async (votingId: number) => {
  await useFetch("/api/vote", {
        method: "POST",
        body: JSON.stringify({
          votingId,
          cname: voteData.value[votingId],
        }),
      })
        .then(async (res) => {
          if (res) {
            if (res.vote) {
              await ElMessageBox.confirm(
                "憑證：" + res.token,
                "投票成功",
                {
                  cancelButtonText: "複製憑證",
                  cancelButtonClass: "el-button--success",
                  confirmButtonText: "確 定",
                  distinguishCancelAndClose: true,
                  autofocus: false,
                  type: "success",
                  roundButton: true,
                  customStyle: {
                    fontFamily: '"Noto Sans TC", sans-serif',
                    overflow: "auto",
                  },
                },
              ).catch(async (action: Action) => {
                if (action === "cancel") {
                  await navigator.clipboard.writeText(res.token);
                  ElMessage({
                    type: "success",
                    message: "已複製",
                  });
                }
              });
            } else {
              await ElMessageBox.confirm(
                "憑證：" + res.token,
                "不可重複投票",
                {
                  cancelButtonText: "複製憑證",
                  cancelButtonClass: "el-button--success",
                  confirmButtonText: "確 定",
                  confirmButtonClass: "el-button--warning",
                  distinguishCancelAndClose: true,
                  autofocus: false,
                  type: "error",
                  roundButton: true,
                  customStyle: {
                    fontFamily: '"Noto Sans TC", sans-serif',
                  },
                },
              ).catch(async (action: Action) => {
                if (action === "cancel") {
                  await navigator.clipboard.writeText(res.token);
                  ElMessage({
                    type: "success",
                    message: "已複製",
                  });
                }
              });
            }
          }
        })
        .catch(() => {
          voteFail.value = true;
        })
        .finally(async () => {
          await votingRefresh();
          freshTime.value = Date.now();
        });
}

const seeToken = async (index: number) => {
  tokenLoading.value[index] = true;

  await ElMessageBox.confirm(data.value!.tokens[index], "投票憑證", {
    cancelButtonText: "複製憑證",
    cancelButtonClass: "el-button--success",
    confirmButtonText: "確 定",
    distinguishCancelAndClose: true,
    autofocus: false,
    type: "success",
    roundButton: true,
    customStyle: {
      fontFamily: '"Noto Sans TC", sans-serif',
    },
  }).catch(async (action: Action) => {
    if (action === "cancel") {
      await navigator.clipboard.writeText(data.value!.tokens[index]);
      ElMessage({
        type: "success",
        message: "已複製",
      });
    }
  });

  tokenLoading.value[index] = false;
};

const seeResult = async (index: number) => {
  resultLoading.value[index] = true;

  if (data.value!.tokens[index]) {
    await ElMessageBox.confirm(data.value!.tokens[index], "投票憑證", {
      cancelButtonText: "複製憑證",
      cancelButtonClass: "el-button--success",
      confirmButtonText: "確 定",
      distinguishCancelAndClose: true,
      autofocus: false,
      type: "success",
      roundButton: true,
      customStyle: {
        fontFamily: '"Noto Sans TC", sans-serif',
      },
    }).catch(async (action: Action) => {
      if (action === "cancel") {
        await navigator.clipboard.writeText(data.value!.tokens[index]);
        ElMessage({
          type: "success",
          message: "已複製",
        });
      } else {
        resultLoading.value[index] = false;
        return;
      }
    });
  } else {
    await ElMessageBox.alert("無投票憑證", "未投票", {
      confirmButtonText: "確 定",
      autofocus: false,
      type: "warning",
      roundButton: true,
      customStyle: {
        fontFamily: '"Noto Sans TC", sans-serif',
      },
    }).catch(() => {
      resultLoading.value[index] = false;
      return;
    });
  }

  await useRouter().push("/result/" + index);
};

const checkData = () => {
  setTimeout(async () => {
    if (votingPending.value) checkData();
    else if (!data.value && useRoute().path == "/vote") {
      ElMessage({
        type: "error",
        message: "操作過於頻繁或不在選舉人名單內",
      });

      setTimeout(() => {
        ElMessage({
          type: "info",
          message: "將自動返回首頁",
        });
      }, 1500);

      setTimeout(async () => {
        if (useRoute().path == "/vote") await useRouter().push("/");
      }, 3000);
    }
  }, 250);
};

onMounted(() => {
  checkData();
});

onActivated(async () => {
  if (Date.now() - freshTime.value > 1000 * 60 * 15) {
    await votingRefresh();
    freshTime.value = Date.now();
  }

  checkData();
});
</script>

<!-- <style>
.grecaptcha-badge {
  @apply z-20;
}
</style> -->
