<template>
    <div
        class="m-auto w-full rounded-xl border-4 border-blue-100 p-5 sm:w-7/12 md:w-1/2 lg:w-5/12 xl:w-1/3 2xl:w-1/4"
    >
        <ElForm
            label-width="auto"
            label-suffix=":"
            ref="formRef"
            :model="addVote"
            :rules="rules"
            hide-required-asterisk
            @keyup.enter.capture="submitForm(formRef)"
        >
            <ElFormItem label="名稱" prop="voteName" class="m-auto">
                <ElSpace>
                    <ElInput
                        v-model="addVote.voteName"
                        placeholder="請輸入名稱"
                        clearable
                    />
                    <ElButton class="invisible ml-2"></ElButton>
                </ElSpace>
            </ElFormItem>
            <ElFormItem label="範圍" prop="voteGroup" class="m-auto">
                <ElSelect
                    v-model="addVote.voteGroup"
                    placeholder="請選擇投票範圍"
                    clearable
                >
                    <el-option
                        v-for="item in groupOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                    />
                </ElSelect>
            </ElFormItem>
            <ElFormItem label="開始時間" prop="startTime">
                <ClientOnly>
                    <ElDatePicker
                        v-model="addVote.startTime"
                        type="datetime"
                        placeholder="請選擇開始時間"
                        format="YYYY/MM/DD HH:mm:ss"
                    />
                </ClientOnly>
            </ElFormItem>
            <ElFormItem label="結束時間" prop="endTime">
                <ClientOnly>
                    <ElDatePicker
                        v-model="addVote.endTime"
                        type="datetime"
                        placeholder="請選擇結束時間"
                        format="YYYY/MM/DD HH:mm:ss"
                    />
                </ClientOnly>
            </ElFormItem>
            <ElFormItem
                v-for="(candidate, index) in addVote.candidates"
                :key="index"
                :prop="'candidates.' + index + '.name'"
                :label="index + 1 + '號候選人'"
                :rules="{
                    required: true,
                    message: '候選人為必填',
                    trigger: 'blur',
                }"
            >
                <div class="inline-flex">
                    <ElInput
                        v-model="candidate.name"
                        placeholder="請輸入候選人名稱"
                        clearable
                    />
                    <ElButton
                        round
                        @click.prevent="removeDomain(candidate)"
                        class="ml-2"
                        :class="{ invisible: index < 2 }"
                    >
                        <span class="font-bold">X</span>
                    </ElButton>
                </div>
            </ElFormItem>
            <ElFormItem>
                <ElSpace class="m-auto">
                    <ElButton @click="addDomain">
                        <span class="font-bold">新增候選人</span>
                    </ElButton>
                    <ElButton type="primary" @click="submitForm(formRef)">
                        <span class="font-bold">創 建</span>
                    </ElButton>
                </ElSpace>
            </ElFormItem>
        </ElForm>
    </div>
    <ElDivider border-style="dashed" />
    <div class="flex justify-center">
        <ElSwitch
            class="mx-3 mb-8"
            v-model="showTime"
            size="large"
            inline-prompt
            active-text="時間"
            inactive-text="時間"
        />
        <ElSwitch
            class="mx-3 mb-8"
            v-model="showOption"
            size="large"
            inline-prompt
            active-text="操作"
            inactive-text="操作"
        />
    </div>
    <div
        class="m-auto w-full rounded-xl border-4 border-blue-100 p-5 md:w-11/12 lg:w-5/6 xl:w-2/3 2xl:w-1/2"
    >
        <ClientOnly>
            <ElTable
                :data="tableData()"
                border
                table-layout="auto"
                empty-text="Empty~~~"
                size="small"
            >
                <div prop="id" class="hidden" />
                <div prop="startTime" class="hidden" />
                <div prop="endTimeStr" class="hidden" />
                <ElTableColumn prop="title" label="名稱" />
                <ElTableColumn prop="group" label="投票範圍" />
                <ElTableColumn
                    v-if="showTime"
                    prop="startTimeStr"
                    label="開始時間"
                />
                <ElTableColumn
                    v-if="showTime"
                    prop="endTimeStr"
                    label="結束時間"
                />
                <ElTableColumn v-if="showOption" label="結果" class="min-w-fit">
                    <template #default="{ row }">
                        <ElButton
                            size="small"
                            type="success"
                            :disabled="
                                new Date(row.endTime).getTime() >= Date.now()
                            "
                            @click="useRouter().push('/vote/' + row.id)"
                        >
                            <span class="font-bold">結 果</span>
                        </ElButton>
                    </template>
                </ElTableColumn>
                <ElTableColumn v-if="showOption" label="操作" class="min-w-fit">
                    <template #default="{ row }">
                        <ElPopconfirm
                            title="確定要刪除嗎？"
                            cancElButton-text="取消"
                            confirm-button-text="確定"
                            @confirm="handleDelete(row.id)"
                        >
                            <template #reference>
                                <ElButton size="small" type="warning">
                                    <span class="font-bold">刪 除</span>
                                </ElButton>
                            </template>
                        </ElPopconfirm>
                    </template>
                </ElTableColumn>
            </ElTable>
        </ClientOnly>
    </div>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

definePageMeta({
    middleware: ['admin'],
    title: '投票管理',
})

const { data: VS, refresh: VSRefresh } = await useLazyFetch('/api/getVS')
const { data: Group, refresh: GroupRefresh } = await useLazyFetch(
    '/api/getGroup'
)

const showTime = ref(false)
const showOption = ref(true)

const formRef = ref<FormInstance>()
interface Candidate {
    name: string
}

const addVote = reactive<{
    voteName: string
    voteGroup: number | undefined
    startTime: string
    endTime: string
    candidates: Candidate[]
}>({
    voteName: '',
    voteGroup: undefined,
    startTime: '',
    endTime: '',
    candidates: [{ name: '' }, { name: '' }],
})

const removeDomain = (item: Candidate) => {
    const index = addVote.candidates.indexOf(item)
    if (index > 1) {
        addVote.candidates.splice(index, 1)
    }
}

const addDomain = () => {
    addVote.candidates.push({ name: '' })
}

const rules = reactive<FormRules>({
    voteName: [{ required: true, message: '名稱為必填', trigger: 'blur' }],
    voteGroup: [{ required: true, message: '組別為必填', trigger: 'change' }],
    startTime: [
        { required: true, message: '開始時間為必填', trigger: 'change' },
    ],
    endTime: [{ required: true, message: '結束時間為必填', trigger: 'change' }],
})

const submitForm = async (formRef: FormInstance | undefined) => {
    if (!formRef) return

    await formRef.validate(async (valid, fields) => {
        if (valid) {
            const { voteName, voteGroup, startTime, endTime, candidates } =
                addVote

            const data = {
                voteName,
                voteGroup,
                startTime,
                endTime,
                candidates: candidates.map((candidate) => candidate.name),
            }

            const res = await $fetch('/api/addVS', {
                method: 'POST',
                body: JSON.stringify(data),
            })

            formRef.resetFields()
            while (addVote.candidates.length > 2) {
                addVote.candidates.pop()
            }

            if (res) {
                ElMessage('創建成功')
                await VSRefresh()
                return
            }

            ElMessage('創建失敗')
        }
    })
}

const groupOptions = computed(() => {
    if (!Group.value) return []

    return Group.value.map((item) => ({
        label: item.name,
        value: item.id,
    }))
})

const tableData = () => {
    if (!VS.value) return []

    return VS.value.map((item) => ({
        id: item.id,
        title: item.name,
        group: item.group.name,
        startTime: new Date(item.startTime),
        startTimeStr: new Date(item.startTime).toLocaleString(),
        endTime: new Date(item.endTime),
        endTimeStr: new Date(item.endTime).toLocaleString(),
    }))
}

const handleDelete = async (id: number) => {
    const res = await $fetch(
        '/api/delVS?' +
            new URLSearchParams({
                id: id.toString(),
            }),
        {
            method: 'DELETE',
        }
    )

    if (!res) {
        ElMessage('刪除失敗')
        return
    }

    ElMessage('刪除成功')
    await VSRefresh()
}

onMounted(async () => {
    const task = []

    task.push(
        setTimeout(async () => {
            if (VS.value === null) {
                await VSRefresh()
            }
        }, 500)
    )

    task.push(
        setTimeout(async () => {
            if (Group.value === null) {
                await GroupRefresh()
            }
        }, 500)
    )

    await Promise.all(task)
})
</script>
