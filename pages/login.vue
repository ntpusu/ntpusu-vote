<template>
    <ClientOnly>
        <div class="content col-s-7 col-m-5 col-b-4">
            <el-alert title="將連線至學生資訊系統進行驗證" description="請使用學生資訊系統的帳號密碼登入" show-icon close-text="了解～" />
            <div style="height: 20px;"></div>
            <el-form ref="formRef" :model="itemEl" :label-width="'auto'" :rules="rules" hide-required-asterisk>
                <el-form-item label="學號:" prop="username">
                    <el-input v-model="itemEl.username" placeholder="請輸入學號" clearable />
                </el-form-item>
                <el-form-item label="密碼:" prop="password">
                    <el-input v-model="itemEl.password" type="password" placeholder="請輸入密碼" show-password clearable />
                </el-form-item>
                <el-form-item label="&nbsp;" prop="verify">
                    <el-checkbox v-model="itemEl.verify" label="同意使用學生資訊系統進行驗證" border />
                </el-form-item>
                <div style="height: 20px;"></div>
                <el-form-item>
                    <el-button type="primary" class="margin" :loading="isLoad" @click="onSubmit(formRef)">登入</el-button>
                </el-form-item>
            </el-form>
            <el-alert v-if="loginFail" title="登入失敗" type="error" description="請確認學號密碼是否正確" show-icon />
        </div>
    </ClientOnly>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from 'element-plus'

const itemEl = reactive({
    username: '',
    password: '',
    verify: false,
})

const isLoad = ref(false)
const loginFail = ref(false)

const formRef = ref<FormInstance>()
const rules = reactive<FormRules>({
    username: [
        { required: true, message: '學號為必填', trigger: 'change' },
    ],
    password: [
        { required: true, message: '密碼為必填', trigger: 'change' },
    ],
    verify: [
        {
            validator: (rule, value, callback) => {
                if (value) {
                    callback()
                } else {
                    callback(new Error('請勾選同意使用學生資訊系統進行驗證'))
                }
            }, trigger: 'change'
        },
    ],
})

const onSubmit = (formEl: FormInstance | undefined) => {
    if (!formEl) return

    formEl.validate((valid, fields) => {
        if (valid) {
            isLoad.value = true

            $fetch('/api/login', {
                method: 'POST',
                body: JSON.stringify({
                    'username': itemEl.username,
                    'password': itemEl.password
                })
            }).then(res => {
                if (res.login_state) {
                    useRouter().push('/')
                }
                else {
                    loginFail.value = true
                    isLoad.value = false
                }
            })
        } else {
            console.log('error submit!', fields)
        }
    })
}
</script>

<style>
.content {
    margin: 5% auto;
}
</style>