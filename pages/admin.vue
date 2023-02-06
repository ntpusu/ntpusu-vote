<template>
    <ClientOnly>
        <div class="content col-s-7 col-m-5 col-b-4">
            <el-form
                :label-width="'auto'"
                ref="formRef"
                :model="addVote"
                :rules="rules"
                hide-required-asterisk
                @keyup.enter.capture="submitForm(formRef)"
            >
                <el-form-item label="名稱:" prop="voteName">
                    <el-input
                        v-model.trim="addVote.voteName"
                        placeholder="請輸入名稱"
                        clearable
                    />
                </el-form-item>
                <el-form-item label="開始時間:" prop="startTime">
                    <el-date-picker
                        v-model="addVote.startTime"
                        type="datetime"
                        placeholder="請選擇開始時間"
                    />
                </el-form-item>
                <el-form-item label="結束時間:" prop="endTime">
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
                    :label="index + 1 + '號候選人:'"
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
                    <el-space class="margin">
                        <el-button @click="addDomain">新增候選人</el-button>
                        <el-button type="primary" @click="submitForm(formRef)"
                            >創建</el-button
                        >
                    </el-space>
                </el-form-item>
            </el-form>
        </div>
        <el-divider border-style="dashed" />
        <div class="content col-s-11 col-m-9 col-b-7">
            <el-table :data="tableData()" border :table-layout="'auto'">
                <el-table-column prop="title" label="Title" />
                <el-table-column prop="startTime" label="startTime" />
                <el-table-column prop="endTime" label="endTime" />
                <el-table-column label="Action" width="90px">
                    <template #default="{ row }">
                        <el-popconfirm
                            title="確定要刪除嗎？"
                            @confirm="handleDelete(row)"
                        >
                            <template #reference>
                                <el-button size="small" type="primary"
                                    >Delete</el-button
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
import { onKeyUp } from '@vueuse/core'
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

<style scoped>
.content {
    margin: 0 auto;
    padding: 20px;
    border: 3px solid #c9d7f8;
    border-radius: 10px;
}
</style>
