<template>
    <ClientOnly>
        <div class="content col-s-7 col-m-5 col-b-4">
            <el-form :label-width="'auto'" ref="formRef" :model="addVote" hide-required-asterisk>
                <el-form-item label="名稱:" required>
                    <el-input v-model="addVote.title" placeholder="請輸入名稱" clearable />
                </el-form-item>
                <el-form-item label="開始時間:" required>
                    <el-date-picker v-model="addVote.startTime" type="datetime" placeholder="Select date and time" />
                </el-form-item>
                <el-form-item label="截止時間:" required>
                    <el-date-picker v-model="addVote.endTime" type="datetime" placeholder="Select date and time" />
                </el-form-item>
                <el-form-item v-for="(candidate, index) in addVote.candidates" :key="index"
                    :label="(index + 1) + '號候選人:'" placeholder="請輸入候選人名稱">
                    <el-space>
                        <el-input v-model="candidate.name" clearable />
                        <el-button v-if="index > 1" @click.prevent="removeDomain(candidate)">X</el-button>
                    </el-space>
                </el-form-item>
                <el-form-item>
                    <el-space class="margin">
                        <el-button @click="addDomain">新增候選人</el-button>
                        <el-button type="primary" @click="submitForm(formRef)">創建</el-button>
                    </el-space>
                </el-form-item>
            </el-form>
        </div>
    </ClientOnly>
    {{ addVote }}
</template>

<script lang="ts" setup>
import type { FormInstance } from 'element-plus'

definePageMeta({
    middleware: ['auth'],
})

const formRef = ref<FormInstance>()
interface Candidate {
    name: string
}

const addVote = reactive<{
    title: string
    startTime: string
    endTime: string
    candidates: Candidate[]
}>({
    title: '',
    startTime: '',
    endTime: '',
    candidates: [
        { name: '' },
        { name: '' },
    ],
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

const submitForm = (formRef: FormInstance | undefined) => {
    if (!formRef) return

    formRef.validate((valid, fields) => {
        if (valid) {

        }
    })
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