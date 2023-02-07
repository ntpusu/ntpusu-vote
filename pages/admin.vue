<template>
    <ClientOnly>
        <div
            class="m-auto w-full rounded-xl border-4 border-blue-100 p-5 sm:w-7/12 md:w-1/2 lg:w-5/12 xl:w-1/3 2xl:w-1/4"
        >
            <el-form
                :label-width="'auto'"
                label-suffix=":"
                ref="formRef"
                :model="addVote"
                :rules="rules"
                hide-required-asterisk
                class="min-w-max"
                @keyup.enter.capture="submitForm(formRef)"
            >
                <el-form-item label="名稱" prop="voteName" class="m-auto">
                    <el-space>
                        <el-input
                            v-model.trim="addVote.voteName"
                            placeholder="請輸入名稱"
                            clearable
                        />
                        <el-button class="!hidden"></el-button>
                    </el-space>
                </el-form-item>
                <el-form-item label="開始時間" prop="startTime" class="m-auto">
                    <el-date-picker
                        v-model="addVote.startTime"
                        type="datetime"
                        placeholder="請選擇開始時間"
                    />
                </el-form-item>
                <el-form-item label="結束時間" prop="endTime">
                    <el-date-picker
                        v-model="addVote.endTime"
                        type="datetime"
                        placeholder="請選擇結束時間"
                    />
                </el-form-item>
                <el-form-item
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
                    <el-space>
                        <el-input
                            v-model.trim="candidate.name"
                            placeholder="請輸入候選人名稱"
                            clearable
                        />
                        <el-button
                            v-if="index > 1"
                            @click.prevent="removeDomain(candidate)"
                            >X</el-button
                        >
                    </el-space>
                </el-form-item>
                <el-form-item>
                    <el-space class="m-auto">
                        <el-button @click="addDomain">新增候選人</el-button>
                        <el-button type="primary" @click="submitForm(formRef)"
                            >創建</el-button
                        >
                    </el-space>
                </el-form-item>
            </el-form>
        </div>
        <el-divider border-style="dashed" />
        <div
            class="m-auto w-full rounded-xl border-4 border-blue-100 p-5 md:w-11/12 lg:w-3/4 xl:w-7/12 2xl:w-1/3"
        >
            <el-table :data="tableData()" border :table-layout="'auto'">
                <el-table-column prop="title" label="名稱" />
                <el-table-column prop="startTime" label="開始時間" />
                <el-table-column prop="endTime" label="結束時間" />
                <el-table-column label="操作" width="80px">
                    <template #default="{ row }">
                        <el-popconfirm
                            title="確定要刪除嗎？"
                            cancel-button-text="取消"
                            confirm-button-text="確定"
                            @confirm="handleDelete(row)"
                        >
                            <template #reference>
                                <el-button size="small" type="primary"
                                    >刪除</el-button
                                >
                            </template>
                        </el-popconfirm>
                    </template>
                </el-table-column>
            </el-table>
        </div>
    </ClientOnly>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

definePageMeta({
    middleware: ['auth'],
})

const formRef = ref<FormInstance>()
interface Candidate {
    name: string
}

const addVote = reactive<{
    voteName: string
    startTime: string
    endTime: string
    candidates: Candidate[]
}>({
    voteName: '',
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
    startTime: [
        { required: true, message: '開始時間為必填', trigger: 'change' },
    ],
    endTime: [{ required: true, message: '結束時間為必填', trigger: 'change' }],
})

const submitForm = async (formRef: FormInstance | undefined) => {
    if (!formRef) return

    await formRef.validate(async (valid, fields) => {
        if (valid) {
            const { voteName, startTime, endTime, candidates } = addVote

            const data = {
                voteName,
                startTime,
                endTime,
                candidates: candidates.map((candidate) => candidate.name),
            }

            const res = await $fetch('/api/addVS', {
                method: 'POST',
                body: JSON.stringify(data),
            })

            formRef.resetFields()

            if (res.data) {
                ElMessage('創建成功')
                VSRefresh()
                return
            }

            ElMessage('創建失敗')
        }
    })
}

const {
    data: VS,
    pending: VSPending,
    refresh: VSRefresh,
} = await useFetch('/api/voteSession')

const newDate = (time: Date) => {
    return new Date(time)
}

const tableData = () => {
    if (!VS) return []

    return VS.value?.map((item) => ({
        title: item.name,
        startTime: newDate(item.startTime).toLocaleString(),
        endTime: newDate(item.endTime).toLocaleString(),
    }))
}

const handleDelete = async (row: any) => {
    await $fetch('/api/delVS?title=' + row.title, {
        method: 'DELETE',
    })

    ElMessage('刪除成功')
    VSRefresh()
}
</script>
